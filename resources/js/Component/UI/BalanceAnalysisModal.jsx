import React from 'react';
import { X, TrendingUp, TrendingDown, Wallet, DollarSign, PiggyBank, Trophy } from 'lucide-react';

const BalanceAnalysisModal = ({ account, isOpen, onClose }) => {
    if (!isOpen) return null;

    // Extract balance data with fallbacks
    const totalBalance = account?.total_balance ?? 0;
    const availableBalance = account?.available_balance ?? 0;
    const investedBalance = account?.invested_balance ?? 0;
    const demoBalance = account?.demo_balance ?? 0;
    const profit = account?.profit ?? 0;
    const totalDeposits = account?.total_deposits ?? 0;
    const unrealizedPnl = account?.unrealized_pnl ?? 0;
    const realizedPnl = account?.realized_pnl ?? 0;

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Get profit color and icon
    const getProfitDisplay = (value) => {
        const isPositive = value >= 0;
        return {
            color: isPositive ? 'text-green-400' : 'text-red-400',
            bgColor: isPositive ? 'bg-green-500/10' : 'bg-red-500/10',
            borderColor: isPositive ? 'border-green-500/20' : 'border-red-500/20',
            icon: isPositive ? TrendingUp : TrendingDown,
        };
    };

    const profitDisplay = getProfitDisplay(profit);
    const ProfitIcon = profitDisplay.icon;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl overflow-hidden bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-6 py-5 border-b border-gray-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Balance Analysis</h2>
                            <p className="mt-1 text-sm text-gray-400">Comprehensive account overview</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-gray-700/50"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Total Balance - Featured */}
                    <div className="relative p-6 overflow-hidden border border-cyan-500/30 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                        <div className="absolute top-0 right-0 opacity-10">
                            <Wallet className="w-32 h-32 text-cyan-400" />
                        </div>
                        <div className="relative">
                            <p className="text-sm font-medium text-gray-400">Total Balance</p>
                            <p className="mt-2 text-4xl font-bold text-white">{formatCurrency(totalBalance)}</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${profitDisplay.bgColor}`}>
                                    <ProfitIcon className={`w-4 h-4 ${profitDisplay.color}`} />
                                    <span className={`text-sm font-semibold ${profitDisplay.color}`}>
                                        {formatCurrency(profit)}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">Total Profit/Loss</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Breakdown Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Available Balance */}
                        <div className="p-4 transition-all duration-200 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 border border-gray-600/50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Available Balance</p>
                                    <p className="text-lg font-semibold text-white">{formatCurrency(availableBalance)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Invested Balance */}
                        <div className="p-4 transition-all duration-200 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 border border-gray-600/50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Invested Balance</p>
                                    <p className="text-lg font-semibold text-white">{formatCurrency(investedBalance)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Demo Balance */}
                        <div className="p-4 transition-all duration-200 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 border border-gray-600/50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Trophy className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Demo Balance</p>
                                    <p className="text-lg font-semibold text-white">{formatCurrency(demoBalance)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Deposits */}
                        <div className="p-4 transition-all duration-200 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 border border-gray-600/50">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <PiggyBank className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Total Deposits</p>
                                    <p className="text-lg font-semibold text-white">{formatCurrency(totalDeposits)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* P&L Breakdown */}
                    <div className={`p-4 border rounded-xl ${profitDisplay.borderColor} ${profitDisplay.bgColor}`}>
                        <h3 className="mb-3 text-sm font-semibold text-white">Profit & Loss Breakdown</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Realized P&L</span>
                                <span className={`text-sm font-semibold ${realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(realizedPnl)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Unrealized P&L</span>
                                <span className={`text-sm font-semibold ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(unrealizedPnl)}
                                </span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-gray-600/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">Total Profit/Loss</span>
                                    <span className={`text-lg font-bold ${profitDisplay.color}`}>
                                        {formatCurrency(profit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                    <p className="text-xs text-center text-gray-500">
                        All values are in USD • Data updates in real-time
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BalanceAnalysisModal;
