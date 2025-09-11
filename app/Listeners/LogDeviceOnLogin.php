<?php

namespace App\Listeners;

use App\Models\UserDevice;
use App\Models\UserSession;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Jenssegers\Agent\Agent;

class LogDeviceOnLogin
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
    public function handle(Login $event): void
    {
        $user = $event->user;
        $agent = new Agent();
        $agent->setUserAgent(request()->header('User-Agent'));

        $deviceName = $agent->device() ?: 'Unknown';
        $ipAddress = request()->ip();

        // Fetch location from IP using ipinfo.io (or any other IP geolocation API)
        $location = 'Unknown';
        try {
            $response = Http::get("https://ipinfo.io/{$ipAddress}?token=00a408e04cc4f3");
            if ($response->ok()) {
                $data = $response->json();
                $location = collect([
                    $data['city'] ?? null,
                    $data['region'] ?? null,
                    $data['country'] ?? null,
                ])->filter()->implode(', ');
            }
        } catch (\Exception $e) {
            Log::warning("IP location fetch failed for {$ipAddress}: " . $e->getMessage());
        }

        $device = UserDevice::updateOrCreate(
            [
                'user_id' => $user->id,
                'user_agent' => request()->header('User-Agent'),
                'ip_address' => $ipAddress,
            ],
            [
                'device_name' => $deviceName,
                'location' => !empty($location) ? $location : 'Unknown',
                'is_active' => true,
                'last_login_at' => now(),
            ]
        );
    }
}
