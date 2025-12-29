<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account;

        $trades = $user->trades()->with('asset')->get();

        $total_trade_amount = $trades->sum(fn($trade) => $trade->amount ?? 0);
        $total_profit_loss = $trades->sum(fn($trade) => $trade->profit_loss ?? 0);
        $total_portfolio_value = ($account?->total_balance ?? 0) + $total_profit_loss;

        $performance_metric_monthly = $this->calculatePerformanceMetric($trades, 30);

        $active_trades = $trades->where('status', 'active')->map(function ($trade) {
            $current_price = $trade->asset->current_price ?? 0;
            $price_change = $current_price - $trade->entry_price;
            $strategy = $trade->strategy;

            return [
                'id' => $trade->id,
                'asset' => $trade->asset,
                'amount' => $trade->amount,
                'entry_price' => $trade->entry_price,
                'current_price' => $current_price,
                'price_change' => $price_change,
                'strategy' => $strategy,
                'opened_at' => $trade->opened_at,
            ];
        });

        // Calculate risk score based on strategies
        $strategy_points = [
            'aggressive' => 3,
            'balanced' => 2,
            'conservative' => 1,
        ];

        $max_points = $active_trades->count() * 3;
        $total_points = $active_trades->sum(function ($trade) use ($strategy_points) {
            return $strategy_points[$trade['strategy']] ?? 0;
        });

        $risk_score_value = $max_points > 0 ? round(($total_points / $max_points) * 10, 1) : 0;
        $risk_score = "{$risk_score_value}/10";

        $strategy_performance = $active_trades->groupBy('strategy')->map(function ($trades, $strategy) {
            $totalAmount = $trades->sum(fn($trade) => $trade['amount'] ?? 0);
            $totalProfitLoss = $trades->sum(fn($trade) => ($trade['price_change'] * ($trade['amount'] / $trade['entry_price'])) ?? 0);
            $performancePercent = $totalAmount > 0 ? ($totalProfitLoss / $totalAmount) * 100 : 0;

            return [
                'total_amount' => $totalAmount,
                'total_profit_loss' => $totalProfitLoss,
                'performance_percent' => round($performancePercent, 2),
            ];
        });

        // Ensure all strategies are present
        $allStrategies = ['aggressive', 'balanced', 'conservative'];

        foreach ($allStrategies as $strategy) {
            if (!isset($strategy_performance[$strategy])) {
                $strategy_performance[$strategy] = [
                    'total_amount' => 0,
                    'total_profit_loss' => 0,
                    'performance_percent' => 0,
                ];
            }
        }

        return Inertia::render('Assets/Index', [
            'assets' => Asset::all(),
            'account' => $account,
            'total_trade_amount' => $total_trade_amount,
            'total_profit_loss' => $total_profit_loss,
            'total_portfolio_value' => $total_portfolio_value,
            'performance_metric_monthly' => $performance_metric_monthly,
            'active_trades' => $active_trades,
            'risk_score' => $risk_score,
            'strategy_performance' => $strategy_performance,
        ]);
    }

    private function calculatePerformanceMetric($trades, $days)
    {
        $cutoffDate = now()->subDays($days);
        $recentTrades = $trades->filter(fn($trade) => $trade->opened_at >= $cutoffDate && $trade->status === 'closed');

        if ($recentTrades->isEmpty()) {
            return 0;
        }

        $totalProfitLoss = $recentTrades->sum(fn($trade) => $trade->profit_loss ?? 0);
        $totalAmount = $recentTrades->sum(fn($trade) => $trade->amount ?? 0);

        return $totalAmount > 0 ? ($totalProfitLoss / $totalAmount) * 100 : 0;
    }
}
