<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Trade;
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
        // Loop through users with accounts
        User::with('account')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $account = $user->account;

                if (!$account) {
                    continue;
                }

                $available = $account->available_balance;

                if ($available > 0) {
                    DB::transaction(function () use ($user, $account, $available) {
                        // Create a trade
                        $trade = Trade::create([
                            'user_id'   => $user->id,
                            'asset_id'  => null, // or pick a default asset
                            'strategy'  => 'balanced', // or dynamic
                            'amount'    => $available,
                            'entry_price' => 1, // placeholder, set real market price
                            'duration_minutes' => 60, // example: 1 hour
                            'status'    => 'active',
                            'opened_at' => now(),
                            'metadata'  => json_encode(['auto' => true]),
                        ]);

                        // Update balances
                        $account->decrement('available_balance', $available);
                        $account->increment('invested_balance', $available);

                        Log::info("Created trade {$trade->id} for user {$user->id} with amount {$available}");
                    });
                }
            }
        });
    }
}