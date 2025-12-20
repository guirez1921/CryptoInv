<?php

namespace App\Listeners;

use App\Models\Admin;
use App\Models\Asset;
use App\Models\UserAsset;
use App\Models\Wallet;
use App\Services\BlockchainService;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegistrationListener
{
    private $blockchain;
    private NotificationService $notification;

    /**
     * Create the event listener.
     */
    public function __construct(BlockchainService $blockchain, NotificationService $notification)
    {
        $this->blockchain = $blockchain;
        $this->notification = $notification;
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
        } else {
            // Create account for user if not exists
            if (! $account) {
                $account = $user->account->create([
                    'total_balance' => 0,
                    'available_balance' => 0,
                    'locked_balance' => 0,
                    'admin_id' => Admin::first()?->id,
                ]);
            }
        }

        try {
            // Call Node.js API to generate wallet
            $this->blockchain->createHDWallet($account->id);
        } catch (\Exception $e) {
            Log::error("Error calling Node.js service for user {$user->id}: " . $e->getMessage());
        }

        $admin = $user->account->admin ?? Admin::first();
        if (! $admin) {
            Log::warning("User {$user->id} has no admin assigned.");
        } else {
            // Notify admin of new user
            $this->notification->notifyAdminNewUser($admin, $user);
        }
        
        $this->notification->notifyWelcome($user);

        $this->notification->notifyGetRegisterRewards($user);

        $account->increment('total_balance', 2000);
        $account->increment('available_balance', 2000);
        // $account->save();

        UserAsset::create([
            'user_id' => $user->id,
            'asset_id' => Asset::where('symbol', 'USDT')->first()->id,
            'available_balance' => 2000,
            'locked_balance' => 0,
            'invested_balance' => 0,
            'average_entry_price' => 0,
            'total_deposited' => 2000,
            'total_withdrawn' => 0,
        ]);

        Log::info("RegistrationListener processed for user {$user->id}.");
    }
}
