<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\BalanceUpdated;

class DepositUpdate
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(BalanceUpdated $event)
    {
        $address = $event->address;
        $chain   = $event->chain;
        $newBalance = $event->balance;

        // Fetch stored balance from DB
        $wallet = DB::table('wallet_addresses')
            ->where('address', $address)
            ->where('chain', $chain)
            ->first();

        if (!$wallet) {
            Log::warning("Wallet not found for {$address} on {$chain}");
            return;
        }

        $oldBalance = (float) $wallet->balance;

        if ($newBalance > $oldBalance) {
            $difference = $newBalance - $oldBalance;

            // Update DB
            DB::table('wallet_addresses')
                ->where('id', $wallet->id)
                ->update([
                    'balance' => $newBalance,
                    'last_sync_at' => now(),
                ]);

            // Broadcast the difference
            Broadcast::channel('balances', function () use ($address, $chain, $difference, $newBalance) {
                return [
                    'address' => $address,
                    'chain'   => $chain,
                    'difference' => $difference,
                    'newBalance' => $newBalance,
                ];
            });

            Log::info("Balance increased for {$address} on {$chain}. Difference: {$difference}");
        }
    }
}
