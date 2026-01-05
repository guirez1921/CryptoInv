<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Trade;
use App\Models\Account;
use App\Models\Asset;
use App\Models\UserAsset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoCreateTradesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Loop through users with accounts and their crypto assets
        User::with(['account', 'userAssets.asset'])->chunk(100, function ($users) {
            foreach ($users as $user) {
                // 1. Process USD Balance Trade
                $account = $user->account;
                if ($account) {
                    $available = (float)$account->available_balance;
                    if ($available > 1.0) { // Only trade if balance > $1
                        $percent = rand(5, 20) / 100; // 5% to 20%
                        $amount = round($available * $percent, 2);
                        $this->createTrade($user, $account, null, $amount);
                    }
                }

                // 2. Process Crypto Asset Trades
                foreach ($user->userAssets as $userAsset) {
                    $assetBalance = (float)$userAsset->available_balance;
                    if ($assetBalance > 0) {
                        $percent = rand(5, 20) / 100;
                        $amount = $assetBalance * $percent;
                        $this->createTrade($user, $account, $userAsset->asset, $amount, $userAsset);
                    }
                }
            }
        });
    }

    /**
     * Create a trade and update corresponding balance
     */
    private function createTrade(User $user, ?Account $account, ?Asset $asset, float $amount, ?UserAsset $userAsset = null): void
    {
        try {
            DB::transaction(function () use ($user, $account, $asset, $amount, $userAsset) {
                $price = $asset ? ($asset->current_price_usd ?? 1) : 1;
                $strategies = ['balanced', 'aggressive', 'conservative'];
                $durations = [30, 60, 120, 240]; // minutes

                $trade = Trade::create([
                    'user_id'    => $user->id,
                    'account_id' => $account ? $account->id : null,
                    'asset_id'   => $asset ? $asset->id : null,
                    'strategy'   => $strategies[array_rand($strategies)],
                    'amount'     => $amount,
                    'entry_price' => $price,
                    'duration_minutes' => $durations[array_rand($durations)],
                    'status'     => 'active',
                    'opened_at'  => now(),
                    'metadata'   => [
                        'auto' => true,
                        'asset_symbol' => $asset ? $asset->symbol : 'USD',
                        'type' => $asset ? 'crypto' : 'fiat'
                    ],
                ]);

                if ($userAsset) {
                    // Update UserAsset balance
                    $userAsset->decrement('available_balance', $amount);
                    $userAsset->increment('invested_balance', $amount);
                } elseif ($account) {
                    // Update Account balance (USD)
                    $account->decrement('available_balance', $amount);
                    $account->increment('invested_balance', $amount);
                }

                Log::info("Created auto-trade {$trade->id} for user {$user->id} with amount {$amount} " . ($asset ? $asset->symbol : 'USD'));
            });
        } catch (\Exception $e) {
            Log::error("Failed to create auto-trade for user {$user->id}: " . $e->getMessage());
        }
    }
}