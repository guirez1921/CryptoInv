<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\LoginActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile page.
     */
    public function show(): Response
    {
        $user = Auth::user()->load(['account', 'sessions' => function ($query) {
            $query->latest()->limit(5);
        }]);

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // 'phone' => $user->phone,
                // 'telegram' => $user->telegram,
                'email_verified_at' => $user->email_verified_at,
                'kyc_status' => $user->preferences()->kyc_status ?? 'not_verified',
                'subscription_tier' => $user->subscription_tier ?? 'free',
                'two_factor_enabled' => $user->preferences()->two_factor_enabled ?? false,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'wallets' => $user->account()->wallets()->map(function ($wallet) {
                return [
                    'id' => $wallet->id,
                    'type' => $wallet->type,
                    'address' => $wallet->address,
                    'balance' => $wallet->balance,
                    'is_active' => $wallet->is_active,
                    'created_at' => $wallet->created_at,
                ];
            }),
            'loginActivities' => $user->loginActivities->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'ip_address' => $activity->ip_address,
                    'user_agent' => $activity->user_agent,
                    'location' => $activity->location,
                    'is_current' => $activity->is_current,
                    'created_at' => $activity->created_at,
                ];
            }),
            'notifications' => [
                'trading' => [
                    'daily_reports' => $user->preferences()->notification_daily_reports ?? true,
                    'weekly_summaries' => $user->preferences()->notification_weekly_summaries ?? true,
                    'monthly_statements' => $user->preferences()->notification_monthly_statements ?? true,
                    'trade_execution' => $user->preferences()->notification_trade_execution ?? false,
                ],
                'security' => [
                    'login_new_device' => $user->preferences()->notification_login_new_device ?? true,
                    'failed_login' => $user->preferences()->notification_failed_login ?? true,
                    'password_changes' => $user->preferences()->notification_password_changes ?? true,
                    'withdrawal_requests' => $user->preferences()->notification_withdrawal_requests ?? true,
                ]
            ]
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            // 'telegram' => ['nullable', 'string', 'max:50'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Toggle two-factor authentication.
     */
    public function toggleTwoFactor(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $two_factor_enable = $user->preferences()->two_factor_enable ?? false;

        $user->preferences()->update([
            'two_factor_enabled' => !$two_factor_enable
        ]);

        $message = $two_factor_enable
            ? 'Two-factor authentication enabled.'
            : 'Two-factor authentication disabled.';

        return back()->with('success', $message);
    }

    /**
     * Update notification preferences.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'daily_reports' => ['boolean'],
            'weekly_summaries' => ['boolean'],
            'monthly_statements' => ['boolean'],
            'trade_execution' => ['boolean'],
            'login_new_device' => ['boolean'],
            'failed_login' => ['boolean'],
            'password_changes' => ['boolean'],
            'withdrawal_requests' => ['boolean'],
        ]);

        Auth::user()->preferences()->update([
            'notification_daily_reports' => $validated['daily_reports'] ?? false,
            'notification_weekly_summaries' => $validated['weekly_summaries'] ?? false,
            'notification_monthly_statements' => $validated['monthly_statements'] ?? false,
            'notification_trade_execution' => $validated['trade_execution'] ?? false,
            'notification_login_new_device' => $validated['login_new_device'] ?? false,
            'notification_failed_login' => $validated['failed_login'] ?? false,
            'notification_password_changes' => $validated['password_changes'] ?? false,
            'notification_withdrawal_requests' => $validated['withdrawal_requests'] ?? false,
        ]);

        return back()->with('success', 'Notification preferences updated.');
    }

    /**
     * Connect a new wallet.
     */
    public function connectWallet(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:bitcoin,ethereum,binance,metamask'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        Auth::user()->account()->wallets()->create([
            'type' => $validated['type'],
            'address' => $validated['address'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Wallet connected successfully.');
    }

    /**
     * Disconnect a wallet.
     */
    public function disconnectWallet(Request $request, $walletId): RedirectResponse
    {
        $wallet = Auth::user()->account()->wallets()->findOrFail($walletId);
        $wallet->delete();

        return back()->with('success', 'Wallet disconnected successfully.');
    }

    /**
     * Revoke a login session.
     */
    public function revokeSession(Request $request, $sessionId): RedirectResponse
    {
        $activity = Auth::user()->loginActivities()->findOrFail($sessionId);

        // In a real implementation, you'd invalidate the actual session
        // For now, we'll just mark it as revoked
        $activity->update(['is_revoked' => true]);

        return back()->with('success', 'Session revoked successfully.');
    }
}
