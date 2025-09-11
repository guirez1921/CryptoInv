<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    //
    public function index(Request $request)
    {
        $user = Auth::user();
        $account = $user->account;

        $total_balance = $account->total_balance;

        $invested_balance = $account->invested_balance;

        $profit = $account->profit;

        $available_balance = $account->available_balance;

        $total_balance_change = 0;

        $profit_change = 0;

        if ($total_balance > 0) {
            $total_balance_change = ($profit / $total_balance) * 100;
        }

        // % profit relative to invested balance
        if ($invested_balance > 0) {
            $profit_change = ($profit / $invested_balance) * 100;
        }

        $trades = $user->trades();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $twoDaysAgo = Carbon::now()->subDays(2)->toDateString();

        $todayProfitLoss = $user->trades()
            ->whereDate('updated_at', $today)
            ->sum('profit_loss');
        $yesterdayProfitLoss = $user->trades()
            ->whereDate('updated_at', $yesterday)
            ->sum('profit_loss');
        $twoDaysAgoProfitLoss = $user->trades()
            ->whereDate('updated_at', $twoDaysAgo)
            ->sum('profit_loss');

        $start = Carbon::now()->subDays(7)->startOfDay();
        $end   = Carbon::now()->endOfDay();

        $dailyProfits = $user->trades()
            ->select(
                DB::raw('DATE(closed_at) as day'),
                DB::raw('SUM(profit_loss) as total_profit')
            )
            ->whereBetween('closed_at', [$start, $end])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Calculate average profit/loss over the days found
        $average = $dailyProfits->avg('total_profit');

        // Find best day
        $bestDay = $dailyProfits->sortByDesc('total_profit')->first();

        $latestNotifications = $user->notifications()
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($notification) {
                return [
                    'title' => $notification->title,
                    'time' => $notification->created_at->diffForHumans(),
                ];
            });

        $deposits = $user->deposits()
            ->select('id', 'amount', 'status', 'created_at')
            ->take(8)
            ->get()
            ->map(function ($deposit) {
                return [
                    'status_badge' => 'deposit',
                    'currency'     => 'USD',
                    'amount'       => $deposit->amount,
                    'status'       => $deposit->status,
                    'date'         => $deposit->created_at->format('d/m/Y'),
                    'created_at'   => $deposit->created_at, // keep for sorting
                ];
            });

        $withdrawals = $user->withdrawals()
            ->select('id', 'amount', 'status', 'created_at')
            ->take(8)
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'status_badge' => 'withdrawal',
                    'currency'     => 'USD',
                    'amount'       => $withdrawal->amount,
                    'status'       => $withdrawal->status,
                    'date'         => $withdrawal->created_at->format('d/m/Y'),
                    'created_at'   => $withdrawal->created_at,
                ];
            });

        $trades = $user->trades()
            ->with('asset:id,name') // eager load asset
            ->select('id', 'asset_id', 'amount', 'status', 'created_at')
            ->take(8)
            ->get()
            ->map(function ($trade) {
                return [
                    'status_badge' => 'trade',
                    'currency'     => optional($trade->asset)->name ?? 'N/A',
                    'amount'       => $trade->amount,
                    'status'       => $trade->status,
                    'date'         => $trade->created_at->format('d/m/Y'),
                    'created_at'   => $trade->created_at,
                ];
            });

        $activities = $deposits
            ->merge($withdrawals)
            ->merge($trades)
            ->sortByDesc('created_at')
            ->take(10)   // 👈 limit to 10
            ->values()
            ->map(function ($activity) {
                unset($activity['created_at']); // remove internal field
                return $activity;
            });

        return Inertia::render('Dashboard/Index', [
            'portfolioData' => [
                'total_balance' => $total_balance,
                'profit_loss' => $profit,
                'invested_balance' => $invested_balance,
                'available_balance' => $available_balance,
                'total_balance_change' => $total_balance_change,
                'profit_change' => $profit_change,
            ],
            'recentTransactions' => $activities,
            'notifications' => $latestNotifications,
            'aiProfitSummary' => [
                'todayProfitLoss' => $todayProfitLoss,
                'yesterdayProfitLoss' => $yesterdayProfitLoss,
                'twoDaysAgoProfitLoss' => $twoDaysAgoProfitLoss,
                'average' => $average,
                'bestDay' => $bestDay,
            ],
            // 'auth' => $user,
        ]);
    }
}
