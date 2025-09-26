<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Get user's minimum withdrawal setting
     */
    public function getMinWithdrawal()
    {
        $user = Auth::user();
        
        return response()->json([
            'min_withdrawal' => $user->account->min_withdrawal ?? 0
        ]);
    }

    /**
     * Update user's minimum withdrawal setting
     */
    public function updateMinWithdrawal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'min_withdrawal' => 'required|numeric|min:50000|max:500000|in:50000,75000,100000,150000,250000,500000'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with('error', 'Invalid minimum withdrawal amount selected.');
        }

        try {
            $user = Auth::user();
            $user->account->min_withdrawal = $request->min_withdrawal;
            $user->save();

            return redirect()->back()->with('success', 'Minimum withdrawal amount updated successfully.');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update minimum withdrawal amount. Please try again.');
        }
    }

    /**
     * Get all user settings
     */
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Settings/Index', [
            'user' => $user,
            'minWithdrawal' => $user->account->min_withdrawal ?? 0,
            'settings' => [
                'notifications' => $user->notification_settings ?? [],
                'security' => [
                    'two_factor_enabled' => $user->two_factor_secret !== null,
                    'email_verified' => $user->email_verified_at !== null,
                ],
            ]
        ]);
    }

    /**
     * Update general settings
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . Auth::id(),
            'phone' => 'sometimes|nullable|string|max:20',
            'country' => 'sometimes|nullable|string|max:100',
            'timezone' => 'sometimes|nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        try {
            $user = Auth::user();
            $user->fill($request->only(['name', 'email', 'phone', 'country', 'timezone']));
            $user->save();

            return redirect()->back()->with('success', 'Settings updated successfully.');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update settings. Please try again.');
        }
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            'transaction_alerts' => 'boolean',
            'price_alerts' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        try {
            $user = Auth::user();
            $user->notification_settings = $request->only([
                'email_notifications',
                'sms_notifications', 
                'push_notifications',
                'marketing_emails',
                'transaction_alerts',
                'price_alerts'
            ]);
            $user->save();

            return redirect()->back()->with('success', 'Notification settings updated successfully.');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update notification settings. Please try again.');
        }
    }

    /**
     * Reset minimum withdrawal (for testing purposes)
     */
    public function resetMinWithdrawal()
    {
        try {
            $user = Auth::user();
            $user->account->min_withdrawal = 0;
            $user->save();

            return redirect()->back()->with('success', 'Minimum withdrawal reset successfully.');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reset minimum withdrawal. Please try again.');
        }
    }
}