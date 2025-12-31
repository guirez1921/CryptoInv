<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\CryptoMarketService;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    private CryptoMarketService $cryptoMarketService;

    public function __construct(CryptoMarketService $cryptoMarketService)
    {
        $this->cryptoMarketService = $cryptoMarketService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $account = $user->account;

        $total_balance = $account?->total_balance ?? 0;
        $invested_balance = $account?->invested_balance ?? 0;
        $profit = $account?->profit ?? 0;
        $available_balance = $account?->available_balance ?? 0;

        $total_balance_change = 0;
        $profit_change = 0;

        if ($total_balance > 0) {
            $total_balance_change = ($profit / $total_balance) * 100;
        }

        // % profit relative to invested balance
        if ($invested_balance > 0) {
            $profit_change = ($profit / $invested_balance) * 100;
        }

        $useFreeAPI = true;
        // $useFreeAPI = config('services.crypto.use_free_api', true);

        $globalMetrics = $this->cryptoMarketService->getGlobalMetrics();
        $fearGreedIndex = $this->cryptoMarketService->getFearGreedIndex();
        // $topCryptocurrencies = $useFreeAPI
        //     ? $this->cryptoMarketService->getTopCryptocurrenciesFromFreeAPI(15)
        //     : $this->cryptoMarketService->getTopCryptocurrencies(15);
        $topCryptocurrencies = $this->cryptoMarketService->getTopCryptocurrenciesFromCoinGecko(15);
        Log::info('Top Cryptocurrencies:', ['data' => $topCryptocurrencies]);

        $averageRSI = $this->cryptoMarketService->calculateAverageRSI($topCryptocurrencies);

        // Get latest notifications
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

        // Get recent transactions
        $deposits = $user->deposits()
            ->select('deposits.id', 'deposits.amount', 'deposits.status', 'deposits.created_at')
            ->take(8)
            ->get()
            ->map(function ($deposit) {
                return [
                    'status_badge' => 'deposit',
                    'currency'     => 'USD',
                    'amount'       => $deposit->amount,
                    'status'       => $deposit->status,
                    'date'         => $deposit->created_at->format('d/m/Y'),
                    'created_at'   => $deposit->created_at,
                ];
            });

        $withdrawals = $user->withdrawals()
            ->select('withdrawals.id', 'withdrawals.amount', 'withdrawals.status', 'withdrawals.created_at')
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
            ->with('asset:id,name')
            ->select('trades.id', 'trades.asset_id', 'trades.amount', 'trades.status', 'trades.created_at')
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
            ->take(10)
            ->values()
            ->map(function ($activity) {
                unset($activity['created_at']);
                return $activity;
            });

        // Log::info();

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
            'cryptoMarketData' => [
                'globalMetrics' => $globalMetrics,
                'fearGreedIndex' => $fearGreedIndex,
                'averageRSI' => $averageRSI,
                'cryptocurrencies' => $topCryptocurrencies,
                'lastUpdated' => now()->toISOString()
            ]
        ]);
    }
}
