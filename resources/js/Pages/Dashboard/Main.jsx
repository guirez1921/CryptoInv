import React, { useState } from 'react';
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Calculator, Bell, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';
import { route } from 'ziggy-js';

const Dashboard = ({
  portfolioData,
  notifications,
  aiProfitSummary,
  recentTransactions = [],
  auth
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [profitData, setProfitData] = useState(aiProfitSummary);

  // Use real data or fallback to defaults
  const portfolio = portfolioData || {
    total_balance: 0,
    available_balance: 0,
    invested_balance: 0,
    profit_loss: 0,
    total_balance_change: 0,
    profit_change: 0
  };

  const performance = performanceMetrics || {
    monthly_profit: 0,
    monthly_percentage: 0,
    total_trades: 0,
    success_rate: 0
  };

  // Handle period change for AI Profit Summary
  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);

    try {
      const response = await fetch(`/dashboard/ai-profit-data?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfitData(data);
      }
    } catch (error) {
      console.error('Error fetching profit data:', error);
    }
  };

  // Get current profit data
  const currentProfitData = profitData?.data || aiProfitSummary?.daily_profits || [];
  const summaryStats = profitData?.summary_stats || aiProfitSummary?.summary_stats || {
    seven_day_average: 0,
    best_day: 0,
    average: 0,
    best_period: 0
  };

  // Get appropriate labels based on period
  const getPeriodLabels = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return {
          averageLabel: '4-Week Average',
          bestLabel: 'Best Week'
        };
      case 'monthly':
        return {
          averageLabel: '3-Month Average',
          bestLabel: 'Best Month'
        };
      default:
        return {
          averageLabel: '7-Day Average',
          bestLabel: 'Best Day'
        };
    }
  };

  const periodLabels = getPeriodLabels();

  return (
    <CryptoAIAuthLayout title="Dashboard - CryptoAI">
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {auth?.user?.name || 'User'}</p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-2xl font-bold text-white">${Number(portfolio.total_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {portfolio.day_change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                )}
                <span className={`text-sm ${portfolio.day_change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {portfolio.day_change >= 0 ? '+' : ''}{Number(portfolio.day_change_percentage || 0).toFixed(1)}% today
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Invested Amount</p>
                  <p className="text-2xl font-bold text-white">${Number(portfolio.invested_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Active investments</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className={`text-2xl font-bold ${portfolio.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    ${Number(portfolio.profit_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {portfolio.profit_percentage >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                )}
                <span className={`text-sm ${portfolio.profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {Number(portfolio.profit_percentage || 0).toFixed(1)}% ROI
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-white">${Number(portfolio.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Ready to invest</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-2">
            {/* AI Profit Summary - Now Dynamic */}
            <div className="lg:col-start-1 lg:col-end-3">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">AI Profit Summary</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePeriodChange('daily')}
                      className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === 'daily'
                          ? 'text-white bg-cyan-600'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => handlePeriodChange('weekly')}
                      className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === 'weekly'
                          ? 'text-white bg-cyan-600'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => handlePeriodChange('monthly')}
                      className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === 'monthly'
                          ? 'text-white bg-cyan-600'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Dynamic Chart Representation */}
                <div className="mb-6 space-y-4">
                  {currentProfitData.length > 0 ? (
                    currentProfitData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-400 min-w-[80px]">{item.day_name || item.period_name}</span>
                        <div className="flex items-center">
                          <div className="w-48 h-2 mr-4 bg-gray-700 rounded-full">
                            <div
                              className={`h-2 rounded-full ${item.is_profitable
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                                  : 'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                              style={{ width: `${Math.max(item.percentage, 5)}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold min-w-[90px] text-right ${item.is_profitable ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {item.formatted_profit}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      No profit data available for the selected period
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-700/30">
                    <p className="text-sm text-gray-400">{periodLabels.averageLabel}</p>
                    <p className="text-lg font-bold text-cyan-400">
                      +${Number(summaryStats.seven_day_average || summaryStats.average || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-700/30">
                    <p className="text-sm text-gray-400">{periodLabels.bestLabel}</p>
                    <p className="text-lg font-bold text-green-400">
                      +${Number(summaryStats.best_day || summaryStats.best_period || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              {/* Quick Actions */}
              <Card>
                <h2 className="mb-6 text-xl font-bold text-white">Quick Actions</h2>
                <div className="flex flex-col space-y-3 gap-y-1">
                  <Link href={route('deposits.create')}>
                    <Button className="justify-start w-full" variant="outline">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </Link>
                  <Link href={route('withdrawals.create')}>
                    <Button className="justify-start w-full" variant="outline">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </Link>
                  <Link href={route('assets.portfolio')}>
                    <Button className="justify-start w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Portfolio
                    </Button>
                  </Link>
                  <Link href={route('chat.index')}>
                    <Button className="justify-start w-full" variant="outline">
                      <Calculator className="w-4 h-4 mr-2" />
                      AI Assistant
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Notifications */}
              <Card className='mt-6'>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-300">Daily profit credited</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-300">Deposit confirmed</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-start-1 lg:col-end-3 lg:row-start-2">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 font-medium text-left text-gray-400">Type</th>
                        <th className="py-3 font-medium text-left text-gray-400">Amount</th>
                        <th className="py-3 font-medium text-left text-gray-400">Status</th>
                        <th className="py-3 font-medium text-left text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions && recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-800">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.type === 'deposit' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                                }`}>
                                {tx.type === 'deposit' && <ArrowDownRight className="w-4 h-4 text-blue-400" />}
                                {tx.type === 'withdrawal' && <ArrowUpRight className="w-4 h-4 text-orange-400" />}
                              </div>
                              <div>
                                <p className="text-white capitalize">{tx.type}</p>
                                <p className="text-xs text-gray-400">{tx.asset}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-white">
                            {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                tx.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-red-500/20 text-red-400'
                              }`}>
                              {tx.status_badge || tx.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-gray-400">
                            No recent transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default Dashboard;