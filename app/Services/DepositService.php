<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\UserAsset;
use App\Models\WalletAddress;
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
        $depositAmount = $deposit->amount; // User's intended USD amount
        $asset = $deposit->asset;
        $price = $asset->current_price_usd ?? 0;

        // Calculate USD value with 5% reduction buffer
        $usdValue = $amount * $price * 0.95;

        Log::info('Processing deposit confirmation', [
            'deposit_id' => $deposit->id,
            'crypto_amount' => $amount,
            'asset' => $asset->symbol,
            'price' => $price,
            'usd_value_raw' => $amount * $price,
            'usd_value_final' => $usdValue,
            'intended_usd' => $depositAmount
        ]);

        $walletAddress = $deposit->walletAddress;
        if ($walletAddress) {
            $walletAddress->increment('balance', $amount);
            $walletAddress->last_sync_at = now();
            $walletAddress->save();
        }

        // Compare discovery with intention and log if discrepancy is significant (> 1%)
        if ($price > 0) {
            $actualUsdValue = $amount * $price;
            $diff = abs($actualUsdValue - $depositAmount);
            if ($diff > ($depositAmount * 0.01)) {
                 Log::warning('Significant deposit amount mismatch', [
                    'expected_usd' => $depositAmount,
                    'actual_usd' => $actualUsdValue,
                    'deposit_id' => $deposit->id,
                ]);
            }
        }

        $deposit->status = 'completed';
        $deposit->confirmed_at = now();
        $deposit->amount = $amount; // Actual crypto amount discovered
        $deposit->metadata = array_merge($deposit->metadata ?? [], [
            'intended_usd_amount' => $depositAmount,
            'crypto_amount' => $amount,
            'conversion_price' => $price,
            'usd_credited' => $usdValue,
            'buffer_applied' => '5%'
        ]);
        $deposit->save();

        $account = $deposit->user->account;
        if ($account) {
            $account->increment('total_balance', $usdValue);
            $account->increment('available_balance', $usdValue);
            $account->increment('total_deposits', $usdValue);
            $account->increment('crypto_balance', $amount);
        }

        UserAsset::handleDepositStatic($deposit);

        $this->notification->notifyDepositConfirmed($deposit->user, $deposit);
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
                (string)$hdWallet->id,
                $chain,
                $walletAddress->asset ?? null
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
