<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\HdWallet;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    private $blockchain;

    public function __construct(BlockchainService $blockchain)
    {
        $this->blockchain = $blockchain;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $userId = $user?->id;
        Log::info('[PaymentController@index] rendering payments index', ['user_id' => $userId]);

        $history = $this->paymentHistoryQuery()->paginate(10);

        $total_deposits = $user->deposits()->where('status', 'completed')->sum('amount');
        $total_withdrawals = $user->withdrawals()->where('status', 'completed')->sum('amount');
        $pending_withdrawals = $user->withdrawals()->where('status', 'pending')->sum('amount');
        $pending_deposits = $user->deposits()->where('status', 'pending')->sum('amount');

        Log::debug('[PaymentController@index] fetched totals and history', [
            'user_id' => $userId,
            'totals' => [
                'deposits' => $total_deposits,
                'withdrawals' => $total_withdrawals,
                'pending_withdrawals' => $pending_withdrawals,
                'pending_deposits' => $pending_deposits,
            ],
            'history_count' => $history->count()
        ]);

        return Inertia::render('Payments/Index', [
            'history' => $history,
            'totals' => [
                'deposits' => $total_deposits,
                'withdrawals' => $total_withdrawals,
                'pending_withdrawals' => $pending_withdrawals,
                'pending_deposits' => $pending_deposits,
            ],
            'user' => $user,
            'accountId' => $user->account?->id,
            'account' => $user->account,
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $userId = $user?->id;
        Log::info('[PaymentController@history] fetching history', ['user_id' => $userId]);

        $history = $this->paymentHistoryQuery()->paginate(10);

        Log::debug('[PaymentController@history] returning history', ['user_id' => $userId, 'count' => $history->count()]);
        return response()->json($history);
    }

    /**
     * Return supported chains by delegating to BlockchainService
     */
    public function supportedChains(Request $request)
    {
        $user = $request->user();
        $userId = $user?->id;
        Log::info('[PaymentController@supportedChains] request', ['user_id' => $userId]);

        try {
            $chains = $this->blockchain->getSupportedChains();
            Log::debug('[PaymentController@supportedChains] result', ['user_id' => $userId, 'chains_count' => is_array($chains) ? count($chains) : 0]);
            return response()->json(['chains' => $chains]);
        } catch (\Exception $e) {
            Log::error('[PaymentController@supportedChains] failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json(['chains' => []], 500);
        }
    }

    /**
     * Get or create a deposit address for the user's account on a given chain
     */
    public function getOrCreateDepositAddress(Request $request, $chain)
    {
        $user = $request->user();
        $userId = $user?->id;
        $account = $user->account;
        $accountId = $account?->id;
        Log::info('[PaymentController@getOrCreateDepositAddress] start', ['user_id' => $userId, 'account_id' => $accountId, 'chain' => $chain]);

        if (!$account) {
            Log::warning('[PaymentController@getOrCreateDepositAddress] no account', ['user_id' => $userId]);
            return response()->json(['error' => 'No account found'], 400);
        }

        // If account already has an address for this chain, return it
        $existingWallet = $account->getDepositAddress($chain);
        if ($existingWallet) {
            Log::info('[PaymentController@getOrCreateDepositAddress] existing address found', ['account_id' => $accountId, 'chain' => $chain]);
            return response()->json(['success' => true, 'depositAddress' => $existingWallet->address]);
        }

        // Otherwise, instruct BlockchainService to create one
        $hdWallet = $account->wallets()->first();
        if (!$hdWallet) {
            Log::info('[PaymentController@getOrCreateDepositAddress] creating hdWallet via BlockchainService', ['account_id' => $accountId, 'chain' => $chain]);
            try {
                // Delegate HD wallet creation to BlockchainService so the required encrypted_seed is set
                $created = $this->blockchain->createHDWallet((string)$accountId, $chain, 'spot');
                Log::debug('[PaymentController@getOrCreateDepositAddress] createHDWallet result', ['account_id' => $accountId, 'chain' => $chain, 'result' => $created]);

                // If the node service returned a wallet id, load the Eloquent model
                if (is_array($created) && !empty($created['walletId'])) {
                    $hdWallet = HdWallet::find($created['walletId']);
                    if (! $hdWallet) {
                        Log::error('[PaymentController@getOrCreateDepositAddress] hdWallet not found after create', ['walletId' => $created['walletId']]);
                        return response()->json(['error' => 'HD wallet created but not found locally'], 500);
                    }
                } else {
                    Log::error('[PaymentController@getOrCreateDepositAddress] createHDWallet returned unexpected result', ['result' => $created]);
                    return response()->json(['error' => 'Failed to create hd wallet', 'result' => $created], 500);
                }
            } catch (\Exception $e) {
                Log::error('[PaymentController@getOrCreateDepositAddress] createHDWallet failed', ['account_id' => $accountId, 'chain' => $chain, 'error' => $e->getMessage()]);
                return response()->json(['error' => 'Failed to create hd wallet', 'detail' => $e->getMessage()], 500);
            }
        }

        // Call BlockchainService to create an address for the hd wallet
        try {
            Log::info('[PaymentController@getOrCreateDepositAddress] calling blockchain service', ['hdWalletId' => $hdWallet->id, 'chain' => $chain]);
            $result = $this->blockchain->createAddress((string)$hdWallet->id, $chain);
            Log::debug('[PaymentController@getOrCreateDepositAddress] blockchain result', ['result' => $result]);
        } catch (\Exception $e) {
            Log::error('[PaymentController@getOrCreateDepositAddress] createAddress failed', ['hdWalletId' => $hdWallet->id ?? null, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create address', 'detail' => $e->getMessage()], 500);
        }

        $address = $result['address'];
        // if (is_array($result) && !empty($result['address'])) {
        //     // Persist address into WalletAddress or HdWallet addresses relationship
        //     $hdWallet->addresses()->create([
        //         'address' => $address,
        //         'is_used' => false,
        //         'address_index' => $hdWallet->address_index + 1,
        //     ]);
        //     // bump address index
        // }
        $hdWallet->incrementAddressIndex(1);

        Log::info('[PaymentController@getOrCreateDepositAddress] address persisted', ['hdWalletId' => $hdWallet->id, 'address' => $address]);
        return response()->json(['success' => true, 'depositAddress' => $address]);

        Log::error('[PaymentController@getOrCreateDepositAddress] address creation failed', ['hdWalletId' => $hdWallet->id ?? null, 'result' => $result]);
        return response()->json(['error' => 'Address creation failed', 'result' => $result], 500);
    }

    /**
     * Start monitoring a deposit address for incoming funds
     */
    public function startDepositMonitoring(Request $request)
    {
        $user = $request->user();
        $userId = $user?->id;

        $request->validate([
            'address' => 'required|string',
            'chain' => 'required|string',
        ]);

        $address = $request->input('address');
        $chain = $request->input('chain');
        Log::info('[PaymentController@startDepositMonitoring] start', ['user_id' => $userId, 'address' => $address, 'chain' => $chain]);

        try {
            $this->blockchain->startBalanceCheck($address, $chain);
            Log::info('[PaymentController@startDepositMonitoring] monitoring_started', ['user_id' => $userId, 'address' => $address]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('[PaymentController@startDepositMonitoring] failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to start monitoring', 'detail' => $e->getMessage()], 500);
        }
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'chain' => 'required'
        ]);
        $user = $request->user();
        $userId = $user?->id;
        $account = $user->account;
        $accountId = $account?->id;
        $asset = Asset::where('abv_name', $request->chain)->first();
        $chain = $request['chain'];
        $wallet = $account->getDepositAddress($chain);
        $amount = $request['amount'];
        if (! $asset) {
            Log::warning('[PaymentController@deposit] invalid_chain', ['user_id' => $userId, 'chain' => $request->chain]);
            return redirect()->route('payments.index')->with('error', 'Invalid chain selected for deposit.');
        }

        Log::info('[PaymentController@deposit] start', ['user_id' => $userId, 'account_id' => $accountId, 'amount' => $request->amount, 'chain' => $request->chain]);

        $deposit = $user->deposits()->create([
            'amount' => $amount,
            'status' => 'pending',
            'asset_id' => $asset->id,
            'chain' => $chain,
            'wallet_address_id' => $wallet->id ?? null,
        ]);
        $deposit->save();

        Log::debug('[PaymentController@deposit] deposit_created', ['user_id' => $userId, 'deposit_id' => $deposit->id ?? null]);

        $address = $wallet ? $wallet->address : null;
        if (! $address) {
            Log::warning('[PaymentController@deposit] no_deposit_address', ['user_id' => $userId, 'chain' => $chain]);
            return redirect()->route('payments.index')->with('error', 'No deposit address found for the selected chain.');
        }

        try {
            $this->blockchain->startBalanceCheck($deposit);
            Log::info('[PaymentController@deposit] started_balance_check', ['user_id' => $userId, 'address' => $address, 'chain' => $chain]);
        } catch (\Exception $e) {
            Log::error('[PaymentController@deposit] startBalanceCheck failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
        }

        return redirect()->route('payments.index')->with('success', 'Deposit request submitted successfully.');
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);
        $user = $request->user();
        $userId = $user?->id;
        $account = $user->account;
        $accountId = $account?->id;
        Log::info('[PaymentController@withdraw] start', ['user_id' => $userId, 'account_id' => $accountId, 'amount' => $request->amount]);

        // Set withdrawal quota
        $withdrawalQuota = $account->min_withdrawal ?? 25000;

        if ($request->amount > $withdrawalQuota) {
            Log::warning('[PaymentController@withdraw] exceeds_quota', ['user_id' => $userId, 'amount' => $request->amount, 'quota' => $withdrawalQuota]);
            return redirect()->route('payments.index')->with('error', 'Withdrawal amount exceeds the quota of $' . number_format($withdrawalQuota));
        }

        if ($request->amount > $account->balance) {
            Log::warning('[PaymentController@withdraw] insufficient_balance', ['user_id' => $userId, 'amount' => $request->amount, 'balance' => $account->balance]);
            return redirect()->route('payments.index')->with('error', 'Insufficient balance for withdrawal.');
        }

        $withdrawal = $user->withdrawals()->create([
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        // Deduct from balance immediately
        $account->decrement('balance', $request->amount);
        Log::info('[PaymentController@withdraw] withdrawal_created', ['user_id' => $userId, 'withdrawal_id' => $withdrawal->id ?? null, 'new_balance' => $account->balance]);

        return redirect()->route('payments.index')->with('success', 'Withdrawal request submitted successfully.');
    }

    private function paymentHistoryQuery()
    {
        $user = Auth::user();
        if (! $user) {
            return null;
        }
        
        // Get closed trades (profit/loss)
        $trades = $user->trades()
            ->where('status', 'closed')
            ->selectRaw('
                id as reference_id,
                CASE WHEN profit_loss >= 0 THEN "profit" ELSE "loss" END as type,
                profit_loss as amount,
                COALESCE(closed_at, updated_at) as date,
                "trade" as source
            ');

        // Get deposits
        $deposits = $user->deposits()
            ->selectRaw('
                id as reference_id,
                "deposit" as type,
                amount,
                created_at as date,
                "deposit" as source
            ');

        // Get withdrawals
        $withdrawals = $user->withdrawals()
            ->selectRaw('
                id as reference_id,
                "withdrawal" as type,
                amount,
                created_at as date,
                "withdrawal" as source
            ');

        // Union all queries
        $query = $trades->unionAll($deposits)->unionAll($withdrawals);

        // Return as a query builder so you can paginate
        return DB::query()->fromSub($query, 'payment_history')->orderByDesc('date');
    }
}
