<?php

namespace App\Jobs;

use App\Models\Account;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateAccountStatisticsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Account::where('is_active', true)->chunk(100, function ($accounts) {
            foreach ($accounts as $account) {
                try {
                    $account->syncWithTrades();
                } catch (\Exception $e) {
                    Log::error("Failed to sync account statistics for account {$account->id}: " . $e->getMessage());
                }
            }
        });

        Log::info("UpdateAccountStatisticsJob: Synchronized statistics for active accounts.");
    }
}
