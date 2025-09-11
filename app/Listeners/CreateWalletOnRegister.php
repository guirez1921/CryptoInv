<?php

namespace App\Listeners;

use App\Models\Wallet;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CreateWalletOnRegister
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
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Ensure the user has an account
        $account = $user->account;
        if (! $account) {
            Log::warning("User {$user->id} registered without account.");
            return;
        }

        try {
            // Call Node.js API to generate wallet
            $response = Http::post("http://127.0.0.1:4000/wallet/new/{$account->id}");

            if ($response->successful()) {
                $walletData = $response->json();

                Log::info("Wallet created for user {$user->id}", $walletData);

                // ⚡ No need to create Wallet in Laravel again
                // Node.js already inserted it into the DB
                // If you want to keep a local copy synced, you could refresh:
                // $account->load('wallet');
            } else {
                Log::error("Wallet creation failed for user {$user->id}", [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Error calling Node.js service for user {$user->id}: " . $e->getMessage());
        }
    }
}
