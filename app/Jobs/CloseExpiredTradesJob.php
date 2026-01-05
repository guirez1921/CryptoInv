<?php

namespace App\Jobs;

use App\Models\Trade;
use App\Models\Account;
use App\Models\UserAsset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CloseExpiredTradesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Find active trades that have expired
        Trade::where('status', 'active')
            ->whereRaw('DATE_ADD(opened_at, INTERVAL duration_minutes MINUTE) <= NOW()')
            ->chunk(100, function ($trades) {
                foreach ($trades as $trade) {
                    $this->settleTrade($trade);
                }
            });
    }

    private function settleTrade(Trade $trade): void
    {
        try {
            DB::transaction(function () use ($trade) {
                // Determine Win/Loss (80% Win Rate)
                $isWin = rand(1, 100) <= 80;
                $strategy = $trade->strategy ?? 'balanced';

                // Define P/L ranges (in percentage / 100)
                $ranges = [
                    'aggressive' => ['win' => [0.05, 0.15], 'loss' => [0.05, 0.15]],
                    'balanced'   => ['win' => [0.02, 0.08], 'loss' => [0.02, 0.06]],
                    'conservative' => ['win' => [0.005, 0.03], 'loss' => [0.005, 0.02]],
                ];

                // Fallback for unknown strategy
                $range = $ranges[$strategy] ?? $ranges['balanced'];

                if ($isWin) {
                    $percentage = rand($range['win'][0] * 1000, $range['win'][1] * 1000) / 1000;
                    $roi = 1 + $percentage;
                } else {
                    $percentage = rand($range['loss'][0] * 1000, $range['loss'][1] * 1000) / 1000;
                    $roi = 1 - $percentage;
                }

                $profit_loss = ($trade->amount * $roi) - $trade->amount;
                
                $exit_price = $trade->entry_price * $roi;

                // Update Trade
                $trade->update([
                    'status' => 'closed',
                    'exit_price' => $exit_price,
                    'profit_loss' => $profit_loss,
                    'closed_at' => now(),
                ]);

                // Update Account Statistics
                $account = $trade->account;
                if ($account) {
                    // Update P&L stats
                    $account->increment('profit', $profit_loss);
                    $account->increment('realized_pnl', $profit_loss);
                    
                    // Return funds to available balance
                    $returnAmount = $trade->amount + $profit_loss;
                    
                    if ($trade->asset_id) {
                        // Handle Crypto Asset Settlement
                        $userAsset = UserAsset::where('user_id', $account->user_id)
                            ->where('asset_id', $trade->asset_id)
                            ->first();
                        
                        if ($userAsset) {
                            $userAsset->decrement('invested_balance', $trade->amount);
                            $userAsset->increment('available_balance', $returnAmount);
                        }
                    } else {
                        // Handle USD Settlement
                        $account->decrement('invested_balance', $trade->amount);
                        $account->increment('available_balance', $returnAmount);
                        $account->increment('total_balance', $profit_loss);
                    }
                }

                Log::info("Settled trade {$trade->id} for user " . ($trade->account->user_id ?? 'Unknown') . ". P/L: {$profit_loss}");
            });
        } catch (\Exception $e) {
            Log::error("Failed to settle trade {$trade->id}: " . $e->getMessage());
        }
    }
}
