<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $history = $user->paymentHistoryQuery()->paginate(10);

        $total_deposits = $user->deposits()->sum('amount');
        $total_withdrawals = $user->withdrawals()->sum('amount');
        $pending_withdrawals = $user->withdrawals()->where('status', 'pending')->sum('amount');
        $pending_deposits = $user->deposits()->where('status', 'pending')->sum('amount');

        return Inertia::render('Payments/Index', [
            'history' => $history,
            'totals' => [
                'deposits' => $total_deposits,
                'withdrawals' => $total_withdrawals,
                'pending_withdrawals' => $pending_withdrawals,
                'pending_deposits' => $pending_deposits,
            ],
            'user' => $user,
            'accountId' => $user->account?->id,
            'account' => $user->account,
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $history = $user->paymentHistoryQuery()->paginate(10);

        return response()->json($history);
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);

        $user = $request->user();
        $user->deposits()->create([
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        return redirect()->route('payments.index')->with('success', 'Deposit request submitted successfully.');
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);

        $user = $request->user();
        $account = $user->account;

        // Set withdrawal quota
        $withdrawalQuota = 20000;

        if ($request->amount > $withdrawalQuota) {
            return redirect()->route('payments.index')->with('error', 'Withdrawal amount exceeds the quota of $20,000.');
        }

        if ($request->amount > $account->balance) {
            return redirect()->route('payments.index')->with('error', 'Insufficient balance for withdrawal.');
        }

        $user->withdrawals()->create([
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        // Deduct from balance immediately
        $account->decrement('balance', $request->amount);

        return redirect()->route('payments.index')->with('success', 'Withdrawal request submitted successfully.');
    }

    /**
     * Show the deposit page.
     */
    public function depositPage(Request $request)
    {
        $user = $request->user();
        return Inertia::render('Payments/Deposit', [
            'user' => $user,
        ]);
    }

    /**
     * Show the withdrawal page.
     */
    public function withdrawalPage(Request $request)
    {
        $user = $request->user();
        return Inertia::render('Payments/Withdrawal', [
            'user' => $user,
        ]);
    }
}
