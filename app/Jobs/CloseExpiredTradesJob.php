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
                // Calculate Profit/Loss (Randomly between -2% and +5%)
                // ROI = multiplier (e.g., 0.98 to 1.05)
                $roi = (rand(980, 1050) / 1000); 
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
                        $userAsset = UserAsset::where('user_id', $trade->user_id)
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

                Log::info("Settled trade {$trade->id} for user {$trade->user_id}. P/L: {$profit_loss}");
            });
        } catch (\Exception $e) {
            Log::error("Failed to settle trade {$trade->id}: " . $e->getMessage());
        }
    }
}
