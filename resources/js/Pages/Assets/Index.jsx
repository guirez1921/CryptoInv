import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    PieChart,
    Settings,
} from "lucide-react";
import Card from "@/component/UI/Card";
import Button from "@/component/UI/Button";
import CryptoAIAuthLayout from "@/Layouts/CryptoAIAuthLayout";
import { CartesianGrid, Line as ReChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart } from "recharts";

export default function Assets() {
    const {
        assets,
        account,
        total_trade_amount,
        total_profit_loss,
        total_portfolio_value,
        performance_metric_monthly,
        active_trades,
        risk_score,
        strategy_performance,
    } = usePage().props;

    const [selectedStrategy, setSelectedStrategy] = useState("all");
    const [selectedTrade, setSelectedTrade] = useState("1");

    const filteredTrades =
        selectedStrategy === "all"
            ? active_trades
            : active_trades.filter((t) => t.strategy === selectedStrategy);

    const strategyColors = {
        aggressive: { text: "text-red-400", bg: "bg-red-500/10" },
        balanced: { text: "text-blue-400", bg: "bg-blue-500/10" },
        conservative: { text: "text-green-400", bg: "bg-green-500/10" },
    };

    const getChartData = (tradeId) => {
        const baseData = [
            { time: '00:00', price: 43250, volume: 1200 },
            { time: '04:00', price: 43680, volume: 1800 },
            { time: '08:00', price: 44120, volume: 2200 },
            { time: '12:00', price: 43890, volume: 1600 },
            { time: '16:00', price: 44250, volume: 2400 },
            { time: '20:00', price: 44180, volume: 1900 },
            { time: '24:00', price: 44320, volume: 2100 }
        ];

        if (tradeId) {
            // Modify data based on selected trade
            return baseData.map(point => ({
                ...point,
                price: point.price + Math.random() * 500 - 250,
                volume: point.volume + Math.random() * 400 - 200
            }));
        }

        return baseData;
    };

    const trades = [
        {
            id: '1',
            pair: 'BTC/USDT',
            type: 'Long',
            entry: 43250,
            current: 44180,
            profit: 2.15,
            amount: 1250,
            status: 'open',
            openTime: '2024-01-15 09:30'
        },
        {
            id: '2',
            pair: 'ETH/USDT',
            type: 'Short',
            entry: 2680,
            current: 2645,
            profit: 1.31,
            amount: 2400,
            status: 'open',
            openTime: '2024-01-15 10:45'
        },
        {
            id: '3',
            pair: 'SOL/USDT',
            type: 'Long',
            entry: 98.5,
            current: 102.3,
            profit: 3.86,
            amount: 800,
            status: 'open',
            openTime: '2024-01-15 11:20'
        },
        {
            id: '4',
            pair: 'BTC/USDT',
            type: 'Long',
            entry: 42800,
            current: 44320,
            profit: 4.25,
            amount: 2000,
            status: 'closed',
            openTime: '2024-01-14 14:30',
            closeTime: '2024-01-15 08:15'
        },
        {
            id: '5',
            pair: 'ETH/USDT',
            type: 'Short',
            entry: 2720,
            current: 2688,
            profit: -1.20,
            amount: 1500,
            status: 'closed',
            openTime: '2024-01-14 16:20',
            closeTime: '2024-01-15 07:45'
        }
    ];
    // Do not call setState during render — initialize selectedTrade on mount instead
    useEffect(() => {
        // Ensure default selected trade exists in trades and use string id
        const defaultTrade = trades.length > 0 ? trades[0].id : null;
        if (defaultTrade) setSelectedTrade(String(defaultTrade));
    }, []);

    return (
        <CryptoAIAuthLayout title="Assets - CryptoAI">
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Assets Portfolio
                            </h1>
                            <p className="text-gray-400">
                                Manage your cryptocurrency investments and AI strategies
                            </p>
                        </div>
                        <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Portfolio Settings
                        </Button>
                    </div>

                    {/* Portfolio Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Portfolio Value</p>
                                    <p className="text-2xl font-bold text-white">
                                        ${total_portfolio_value.toFixed(2)}
                                    </p>
                                </div>
                                <PieChart className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                <span className="text-sm text-green-400">
                                    {performance_metric_monthly.toFixed(2)}% (30d)
                                </span>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Profit / Loss</p>
                                    <p
                                        className={`text-2xl font-bold ${total_profit_loss >= 0 ? "text-green-400" : "text-red-400"
                                            }`}
                                    >
                                        {total_profit_loss >= 0 ? "+" : ""}
                                        {total_profit_loss.toFixed(2)}
                                    </p>
                                </div>
                                <Target className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-400">This month</span>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active Trades</p>
                                    <p className="text-2xl font-bold text-white">
                                        {active_trades.length}
                                    </p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-400">Optimized</span>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Risk Score</p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {risk_score}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">⚡</span>
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-400">Moderate Risk</span>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Assets List */}
                        <div className="lg:col-span-2">
                            <div className="card mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">Price Chart</h3>
                                    <div className="text-sm text-gray-400">
                                        {selectedTrade ? `Trade #${selectedTrade} - ${trades.find(t => t.id === selectedTrade)?.pair}` : 'Click on a trade to view details'}
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={getChartData(selectedTrade)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="time" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#F9FAFB' }}
                                        />
                                        <ReChart type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">
                                        Cryptocurrency Assets
                                    </h2>
                                    <div className="flex space-x-2">
                                        {["all", "aggressive", "balanced", "conservative"].map(
                                            (s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedStrategy(s)}
                                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedStrategy === s
                                                        ? {
                                                            all: "bg-cyan-600 text-white",
                                                            aggressive: "bg-red-600 text-white",
                                                            balanced: "bg-blue-600 text-white",
                                                            conservative: "bg-green-600 text-white",
                                                        }[s]
                                                        : "text-gray-400 hover:text-white"
                                                        }`}
                                                >
                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredTrades.length === 0 && (
                                        <p className="text-sm text-gray-400">No assets found.</p>
                                    )}
                                    {filteredTrades.map((trade) => (
                                        <div
                                            key={trade.id}
                                            className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold">
                                                            {trade.asset.symbol.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-semibold">
                                                            {trade.asset.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            {trade.asset.symbol}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-white font-semibold">
                                                        ${trade.current_price}
                                                    </p>
                                                    <div className="flex items-center">
                                                        {trade.price_change >= 0 ? (
                                                            <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3 text-red-400 mr-1" />
                                                        )}
                                                        <span
                                                            className={`text-sm ${trade.price_change >= 0
                                                                ? "text-green-400"
                                                                : "text-red-400"
                                                                }`}
                                                        >
                                                            {trade.price_change >= 0 ? "+" : ""}
                                                            {trade.price_change.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400">Amount</p>
                                                    <p className="text-sm text-white">{trade.amount}</p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400">AI Strategy</p>
                                                    <span
                                                        className={`text-sm font-medium capitalize ${strategyColors[trade.strategy]
                                                            }`}
                                                    >
                                                        {trade.strategy}
                                                    </span>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">Opened At</p>
                                                    <p className="text-sm text-white font-medium">
                                                        {new Date(trade.opened_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Strategy Performance */}
                            <Card>
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Strategy Performance
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(strategy_performance).map(([strategy, perf]) => (
                                        <div
                                            key={strategy}
                                            className={`flex items-center justify-between p-3 rounded-lg ${strategyColors[strategy]?.bg}`}
                                        >
                                            <div>
                                                <p className={`font-medium capitalize ${strategyColors[strategy]?.text}`}>
                                                    {strategy}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {strategy === "aggressive"
                                                        ? "High risk, high reward"
                                                        : strategy === "balanced"
                                                            ? "Moderate risk & reward"
                                                            : "Low risk, steady growth"}
                                                </p>
                                            </div>
                                            <span
                                                className={`font-bold ${perf.performance_percent >= 0
                                                    ? strategyColors[strategy]?.text
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {perf.performance_percent >= 0 ? "+" : ""}
                                                {perf.performance_percent}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </CryptoAIAuthLayout>
    );
}
