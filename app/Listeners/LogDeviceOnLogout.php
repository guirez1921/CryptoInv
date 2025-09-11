<?php

namespace App\Listeners;

use App\Models\UserDevice;
use App\Models\UserSession;
use Illuminate\Auth\Events\Logout;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogDeviceOnLogout
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
    public function handle(Logout $event): void
    {
        $user = $event->user;
        $sessionId = session()->getId();

        if (! $user) {
            return;
        }

        // Find the session
        $session = UserSession::where('session_id', $sessionId)->first();

        if ($session && $session->device_id) {
            // Mark device inactive
            UserDevice::where('id', $session->device_id)
                ->where('user_id', $user->id)
                ->update([
                    'is_active' => false,
                    'last_logout_at' => now(),
                ]);
        }

        // Optionally delete or update the session record
        // if ($session) {
        //     $session->delete(); // or set last_activity = now()
        // }
    }
}
