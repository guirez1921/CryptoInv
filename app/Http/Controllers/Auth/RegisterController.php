<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Admin;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    //
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Add other fields if you have them
            'phone' => ['nullable', 'string', 'max:20'],
            'telegram' => ['nullable', 'string', 'max:50'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'telegram' => $request->telegram,
            'email_verified_at' => Carbon ::now(), // Temporary auto-verification
        ]);

        $admin = Admin::first(); // or assign based on region, role, etc.

        Account::create([
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'total_balance' => 0,
            'available_balance' => 0,
            'invested_balance' => 0,
            'profit' => 0,
            'total_deposits' => 0,
            'total_withdrawals' => 0,
            'unrealized_pnl' => 0,
            'realized_pnl' => 0,
            'last_activity_at' => now(),
            'account_type' => 'standard',
            'is_active' => true,
        ]);


        // Trigger email verification
        // event(new Registered($user));
        
        // Manually invoke RegistrationListener to create wallet without triggering email verification
        app(\App\Listeners\RegistrationListener::class)->handle(new Registered($user));

        // Log the user in
        Auth::login($user);

        // Redirect to email verification notice
        // Redirect to dashboard (skip verification notice)
        return redirect()->route('dashboard');
    }
}
