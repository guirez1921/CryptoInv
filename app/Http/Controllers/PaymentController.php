<?php

namespace App\Http\Controllers;

use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $history = $user->paymentHistoryQuery()->paginate(10);

        $total_deposits = $user->deposits()->sum('amount');
        $total_withdrawals = $user->withdrawals()->sum('amount');
        $pending_withdrawals = $user->withdrawals()->where('status', 'pending')->sum('amount');
        $pending_deposits = $user->deposits()->where('status', 'pending')->sum('amount');

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
        $history = $user->paymentHistoryQuery()->paginate(10);

        return response()->json($history);
    }

    /**
     * Return supported chains by delegating to BlockchainService
     */
    public function supportedChains(Request $request)
    {
        $chains = $this->blockchain->getSupportedChains();
        return response()->json(['chains' => $chains]);
    }

    /**
     * Get or create a deposit address for the user's account on a given chain
     */
    public function getOrCreateDepositAddress(Request $request, $chain)
    {
        $user = $request->user();
        $account = $user->account;

        if (!$account) {
            return response()->json(['error' => 'No account found'], 400);
        }

        // If account already has an address for this chain, return it
        $existing = $account->getDepositAddress($chain);
        if ($existing) {
            return response()->json(['success' => true, 'depositAddress' => $existing]);
        }

        // Otherwise, instruct BlockchainService to create one
        // First ensure there is an HD wallet for this account and chain
        // We'll look for an HdWallet record and use its id; if none exists, create one
        $hdWallet = $account->wallets()->where('chain', $chain)->first();
        if (!$hdWallet) {
            $hdWallet = $account->wallets()->create([
                'type' => 'spot',
                'chain' => $chain,
                'address_index' => 0,
            ]);
        }

        // Call BlockchainService to create an address for the hd wallet
        try {
            $result = $this->blockchain->createAddress((string)$hdWallet->id, $chain);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create address', 'detail' => $e->getMessage()], 500);
        }

        if (is_array($result) && !empty($result['address'])) {
            $address = $result['address'];
            // Persist address into WalletAddress or HdWallet addresses relationship
            $hdWallet->addresses()->create([
                'address' => $address,
                'is_used' => false,
                'address_index' => $hdWallet->address_index + 1,
            ]);
            // bump address index
            $hdWallet->incrementAddressIndex(1);

            return response()->json(['success' => true, 'depositAddress' => $address]);
        }

        return response()->json(['error' => 'Address creation failed', 'result' => $result], 500);
    }

    /**
     * Start monitoring a deposit address for incoming funds
     */
    public function startDepositMonitoring(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'chain' => 'required|string',
        ]);

        $address = $request->input('address');
        $chain = $request->input('chain');

        try {
            $this->blockchain->startBalanceCheck($address, $chain);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
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
        $user->deposits()->create([
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        $chain = $request['chain'];
        
        $address = $user->account->getDepositAddress($chain);
        if (! $address) {
            return redirect()->route('payments.index')->with('error', 'No deposit address found for the selected chain.');
        }

        $this->blockchain->startBalanceCheck($address, $chain);

        return redirect()->route('payments.index')->with('success', 'Deposit request submitted successfully.');
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);

        $user = $request->user();
        $account = $user->account;

        // Set withdrawal quota
        $withdrawalQuota = 20000;

        if ($request->amount > $withdrawalQuota) {
            return redirect()->route('payments.index')->with('error', 'Withdrawal amount exceeds the quota of $20,000.');
        }

        if ($request->amount > $account->balance) {
            return redirect()->route('payments.index')->with('error', 'Insufficient balance for withdrawal.');
        }

        $user->withdrawals()->create([
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        // Deduct from balance immediately
        $account->decrement('balance', $request->amount);

        return redirect()->route('payments.index')->with('success', 'Withdrawal request submitted successfully.');
    }
}
