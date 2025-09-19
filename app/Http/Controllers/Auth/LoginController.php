<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    //
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        // Determine which field to authenticate with
        $loginField = $this->getLoginField($request);
        
        $credentials = $request->validate([
            $loginField => ['required'],
            'password' => ['required'],
        ]);

        // Add additional validation based on login method
        if ($loginField === 'email') {
            $request->validate(['email' => ['email']]);
        }

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                $loginField => __('The provided credentials do not match our records.'),
            ]);
        }

        $request->session()->regenerate();

        // Check if user needs to verify email
        if (!$request->user()->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        if (Auth::user()->is_admin) {
            return redirect()->intended(route('admin.dashboard'));
        }
        return redirect()->intended(route('dashboard'));
    }

    /**
     * Determine the login field based on the request.
     */
    private function getLoginField(Request $request): string
    {
        if ($request->filled('email')) {
            return 'email';
        } elseif ($request->filled('phone')) {
            return 'phone';
        } elseif ($request->filled('telegram')) {
            return 'telegram';
        }
        
        return 'email'; // default
    }
}
