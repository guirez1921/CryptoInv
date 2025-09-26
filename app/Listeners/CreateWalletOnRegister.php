<?php

namespace App\Listeners;

use App\Models\Wallet;
use App\Services\BlockchainService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CreateWalletOnRegister
{
    private $blockchain;

    /**
     * Create the event listener.
     */
    public function __construct(BlockchainService $blockchain)
    {
        $this->blockchain = $blockchain;
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
            $this->blockchain->createHDWallet($account->id);
        } catch (\Exception $e) {
            Log::error("Error calling Node.js service for user {$user->id}: " . $e->getMessage());
        }
    }
}
