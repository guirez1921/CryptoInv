<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\UserAsset;
use App\Models\Wallet;
use App\Services\BlockchainService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepositService
{
    private NotificationService $notification;
    private BlockchainService $blockchain;

    public function __construct(NotificationService $notification, BlockchainService $blockchain)
    {
        $this->notification = $notification;
        $this->blockchain = $blockchain;
    }

    public function confirmDeposit(Deposit $deposit, float $amount): void
    {
        $depositAmount = $deposit->amount;

        $wallet = Wallet::where('address', $deposit->deposit_address)
            ->where('chain', $deposit->chain)
            ->first();

        if ($wallet) {
            $wallet->increment('balance', $amount);
        }

        if ($amount != $depositAmount) {
            // Log a warning if the amounts do not match
            Log::warning('Deposit amount mismatch', [
                'expected' => $depositAmount,
                'actual' => $amount,
                'deposit_id' => $deposit->id,
            ]);
            $this->notification->notifyDepositMismatch($deposit->user, $deposit, $amount);
        } else {
            Log::info('Deposit amount confirmed', [
                'amount' => $amount,
                'deposit_id' => $deposit->id,
            ]);
            $this->notification->notifyDepositConfirmed($deposit->user, $deposit);
        }

        $deposit->status = 'confirmed';
        $deposit->confirmed_at = now();
        $deposit->save();

        $account = $deposit->user->account;
        if ($account) {
            $account->increment('total_balance', $amount);
            $account->increment('available_balance', $amount);
            $account->increment('total_deposits', $amount);
        }

        UserAsset::handleDeposit($deposit);

        $this->notification->notifyAdminDepositAlert($deposit);

        // Sweep to master wallet
        $this->sweepToMasterWallet($deposit, $amount);
    }

    /**
     * Sweep deposited funds to master wallet
     */
    private function sweepToMasterWallet(Deposit $deposit, float $amount): void
    {
        // Check if auto sweep is enabled
        if (!config('master_wallets.auto_sweep_enabled', true)) {
            return;
        }

        // Check minimum amount
        $minimumAmount = config('master_wallets.minimum_sweep_amount', 0.001);
        if ($amount < $minimumAmount) {
            Log::info('Deposit amount below minimum sweep threshold', [
                'amount' => $amount,
                'minimum' => $minimumAmount,
                'deposit_id' => $deposit->id
            ]);
            return;
        }

        // Get master wallet address for the chain
        $chain = strtolower($deposit->chain);
        $masterAddress = config("master_wallets.{$chain}");

        if (empty($masterAddress)) {
            Log::warning('No master wallet configured for chain', [
                'chain' => $chain,
                'deposit_id' => $deposit->id
            ]);
            return;
        }

        try {
            $walletAddress = $deposit->walletAddress;
            if (!$walletAddress) {
                Log::error('No wallet address found for deposit', ['deposit_id' => $deposit->id]);
                return;
            }

            $hdWallet = $walletAddress->hdWallet;
            if (!$hdWallet) {
                Log::error('No HD wallet found for wallet address', ['wallet_address_id' => $walletAddress->id]);
                return;
            }

            // Use blockchain service to transfer to master
            $blockchain = app(BlockchainService::class);
            
            Log::info('Initiating sweep to master wallet', [
                'deposit_id' => $deposit->id,
                'from_address' => $walletAddress->address,
                'to_address' => $masterAddress,
                'amount' => $amount,
                'chain' => $chain
            ]);

            // Call transferToMaster via blockchain service
            $result = $blockchain->transferToMaster(
                $hdWallet->id,
                $walletAddress->id,
                $masterAddress,
                $amount,
                $chain
            );

            if ($result && isset($result['success']) && $result['success']) {
                Log::info('Successfully swept deposit to master wallet', [
                    'deposit_id' => $deposit->id,
                    'tx_hash' => $result['txHash'] ?? null,
                    'amount' => $amount
                ]);

                // Update deposit metadata
                $deposit->metadata = array_merge($deposit->metadata ?? [], [
                    'swept_to_master' => true,
                    'sweep_tx_hash' => $result['txHash'] ?? null,
                    'swept_at' => now()->toISOString(),
                    'master_address' => $masterAddress
                ]);
                $deposit->save();
            } else {
                Log::error('Failed to sweep to master wallet', [
                    'deposit_id' => $deposit->id,
                    'result' => $result
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception during sweep to master wallet', [
                'deposit_id' => $deposit->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
