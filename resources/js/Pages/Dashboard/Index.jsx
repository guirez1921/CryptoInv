import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Calculator, Bell, Eye, Activity, BarChart3, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';
import { route } from 'ziggy-js';

const Dashboard = ({
  portfolioData,
  notifications = [],
  cryptoMarketData,
  recentTransactions = [],
  auth
}) => {
  const [showMinWithdrawalModal, setShowMinWithdrawalModal] = useState(false);
  const [selectedMinWithdrawal, setSelectedMinWithdrawal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [minWithdrawalValue, setMinWithdrawalValue] = useState(null);

  // Fetch current minimum withdrawal from server on mount
  useEffect(() => {
    let mounted = true;

    const fetchMinWithdrawal = async () => {
      try {
        const res = await fetch(route('settings.getMinWithdrawal'));
        if (!res.ok) {
          throw new Error(`Failed to fetch min withdrawal: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        // support different possible keys returned by the endpoint
        const val = data.min_withdrawal ?? data.minWithdrawal ?? data.min ?? 0;
        if (!mounted) return;
        setMinWithdrawalValue(val);
        if (Math.round(val) === 0) {
          setShowMinWithdrawalModal(true);
          console.log('Minimum withdrawal is 0, showing modal.');
        }
      } catch (error) {
        console.error('Error fetching minimum withdrawal:', error);
        // If fetch fails, default to showing modal so user can set it
        if (!mounted) return;
        setMinWithdrawalValue(0);
        setShowMinWithdrawalModal(true);
      }
    };

    fetchMinWithdrawal();

    return () => { mounted = false; };
  }, []);

  // Use real data or fallback to defaults
  const portfolio = portfolioData || {
    total_balance: 0,
    available_balance: 0,
    invested_balance: 0,
    profit_loss: 0,
    total_balance_change: 0,
    profit_change: 0
  };

  const marketData = cryptoMarketData || {
    globalMetrics: {
      total_market_cap: 0,
      bitcoin_dominance: 0,
      market_cap_change_24h: 0
    },
    fearGreedIndex: {
      value: 50,
      classification: 'Neutral'
    },
    averageRSI: 50,
    cryptocurrencies: []
  };

  // Predefined minimum withdrawal options
  const withdrawalOptions = [
    { value: 50000, label: '$50,000' },
    { value: 75000, label: '$75,000' },
    { value: 100000, label: '$100,000' },
    { value: 150000, label: '$150,000' },
    { value: 250000, label: '$250,000' },
    { value: 500000, label: '$500,000' }
  ];

  // Handle minimum withdrawal update
  const handleMinWithdrawalUpdate = async () => {
    if (!selectedMinWithdrawal) return;

    setIsUpdating(true);
    
    try {
      router.post(route('settings.updateMinWithdrawal'), {
        min_withdrawal: selectedMinWithdrawal
      }, {
        onSuccess: () => {
          // update local value and close modal
          setMinWithdrawalValue(selectedMinWithdrawal);
          setShowMinWithdrawalModal(false);
          // You might want to show a success message here
        },
        onError: (errors) => {
          console.error('Error updating minimum withdrawal:', errors);
          // Handle errors appropriately
        },
        onFinish: () => {
          setIsUpdating(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setIsUpdating(false);
    }
  };

  // Format large numbers
  const formatLargeNumber = (number) => {
    if (number >= 1_000_000_000_000) {
      return '$' + (number / 1_000_000_000_000).toFixed(2) + 'T';
    } else if (number >= 1_000_000_000) {
      return '$' + (number / 1_000_000_000).toFixed(2) + 'B';
    } else if (number >= 1_000_000) {
      return '$' + (number / 1_000_000).toFixed(2) + 'M';
    } else if (number >= 1_000) {
      return '$' + (number / 1_000).toFixed(2) + 'K';
    } else {
      return '$' + number.toFixed(2);
    }
  };

  // Get Fear & Greed color
  const getFearGreedColor = (value) => {
    if (value >= 75) return 'text-green-400';
    if (value >= 55) return 'text-yellow-400';
    if (value >= 45) return 'text-orange-400';
    if (value >= 25) return 'text-red-400';
    return 'text-red-500';
  };

  // Get RSI color
  const getRSIColor = (rsi) => {
    if (rsi >= 70) return 'text-red-400';
    if (rsi >= 50) return 'text-green-400';
    if (rsi >= 30) return 'text-orange-400';
    return 'text-blue-400';
  };

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
                  <p className="text-2xl font-bold text-white">
                    ${Number(portfolio.total_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {portfolio.total_balance_change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                )}
                <span className={`text-sm ${portfolio.total_balance_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(portfolio.total_balance_change || 0).toFixed(1)}% by profit
                </span>
              </div>
            </Card>

            {/* <Card>
              <div className="md:flex items-center justify-between hidden">
                <div>
                  <p className="text-sm text-gray-400">Invested Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ${Number(portfolio.invested_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Active investments</span>
              </div>
            </Card> */}

            {/* <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className={`text-2xl font-bold ${portfolio.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Number(portfolio.profit_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {portfolio.profit_change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                )}
                <span className={`text-sm ${portfolio.profit_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(portfolio.profit_change || 0).toFixed(1)}% ROI
                </span>
              </div>
            </Card> */}

            <Card>
              <div className="md:flex items-center justify-between hidden">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${Number(portfolio.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-1">
            {/* Crypto Market Overview */}
            <div className="lg:col-start-1 lg:col-end-3">
              <div className='mb-4'>
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Market Overview</h2>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {/* Market Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-gray-700/30">
                      <p className="text-sm text-gray-400">Market Cap</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {formatLargeNumber(marketData.globalMetrics?.total_market_cap || 0)}
                      </p>
                      <div className="flex items-center mt-1">
                        {marketData.globalMetrics?.market_cap_change_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1 text-red-400" />
                        )}
                        <span className={`text-xs ${marketData.globalMetrics?.market_cap_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.abs(marketData.globalMetrics?.market_cap_change_24h || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-700/30">
                      <p className="text-sm text-gray-400">Fear & Greed</p>
                      <p className={`text-lg font-bold ${getFearGreedColor(marketData.fearGreedIndex?.value || 50)}`}>
                        {marketData.fearGreedIndex?.value || 50}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {marketData.fearGreedIndex?.classification || 'Neutral'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-700/30">
                      <p className="text-sm text-gray-400">Avg RSI</p>
                      <p className={`text-lg font-bold ${getRSIColor(marketData.averageRSI || 50)}`}>
                        {(marketData.averageRSI || 50).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {marketData.averageRSI >= 70 ? 'Overbought' : 
                         marketData.averageRSI >= 50 ? 'Bullish' : 
                         marketData.averageRSI >= 30 ? 'Bearish' : 'Oversold'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Cryptocurrency List */}
              <div>
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Top Cryptocurrencies</h2>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 font-medium text-left text-gray-400">#</th>
                          <th className="py-3 font-medium text-left text-gray-400">Name</th>
                          <th className="py-3 font-medium text-left text-gray-400">Price</th>
                          <th className="py-3 font-medium text-left text-gray-400">24h %</th>
                          <th className="py-3 font-medium text-left text-gray-400">Market Cap</th>
                          <th className="py-3 font-medium text-left text-gray-400">RSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.cryptocurrencies && marketData.cryptocurrencies.length > 0 ? (
                          marketData.cryptocurrencies.map((crypto, index) => (
                            <tr key={crypto.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                              <td className="py-4 text-gray-400">{crypto.market_cap_rank || index + 1}</td>
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={crypto.logo} 
                                    alt={crypto.name}
                                    className="w-8 h-8 rounded-full"
                                    onError={(e) => {
                                      e.target.src = `https://via.placeholder.com/32/374151/9CA3AF?text=${crypto.symbol}`;
                                    }}
                                  />
                                  <div>
                                    <p className="text-white font-medium">{crypto.name}</p>
                                    <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-white font-semibold">
                                ${crypto.price?.toFixed(crypto.price > 1 ? 2 : 6) || '0.00'}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center">
                                  {crypto.percent_change_24h >= 0 ? (
                                    <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
                                  )}
                                  <span className={`text-sm font-medium ${crypto.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {crypto.percent_change_24h?.toFixed(2) || '0.00'}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 text-gray-300">
                                {formatLargeNumber(crypto.market_cap || 0)}
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${getRSIColor(crypto.rsi)} bg-gray-700`}>
                                  {crypto.rsi?.toFixed(1) || '50.0'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-400">
                              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                              <p>No market data available</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <h2 className="mb-6 text-xl font-bold text-white">Quick Actions</h2>
                <div className="flex flex-col space-y-3 gap-y-1">
                  <Link href={route('payments.index')}>
                    <Button className="justify-start w-full" variant="outline">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </Link>
                  <Link href={route('payments.index')}>
                    <Button className="justify-start w-full" variant="outline">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </Link>
                  <Link href={route('assets.index')}>
                    <Button className="justify-start w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Portfolio
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-2 h-2 mt-2 bg-green-400 rounded-full"></div>
                        <div>
                          <p className="text-sm text-gray-300">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No notifications</p>
                  )}
                </div>
              </Card>

              {/* Recent Transactions Card */}
              <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                  {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            tx.status_badge === 'deposit' ? 'bg-blue-500/20' : 
                            tx.status_badge === 'withdrawal' ? 'bg-orange-500/20' : 'bg-green-500/20'
                          }`}>
                            {tx.status_badge === 'deposit' && <ArrowDownRight className="w-3 h-3 text-blue-400" />}
                            {tx.status_badge === 'withdrawal' && <ArrowUpRight className="w-3 h-3 text-orange-400" />}
                            {tx.status_badge === 'trade' && <TrendingUp className="w-3 h-3 text-green-400" />}
                          </div>
                          <div>
                            <p className="text-sm text-white capitalize">{tx.status_badge}</p>
                            <p className="text-xs text-gray-400">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white font-medium">{tx.amount}</p>
                          <p className="text-xs text-gray-400">{tx.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent transactions</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Minimum Withdrawal Modal */}
          {showMinWithdrawalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Set Minimum Withdrawal</h3>
                  <button
                    onClick={() => setShowMinWithdrawalModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    disabled={isUpdating}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 mb-6">
                    Please select your minimum withdrawal amount to proceed with transactions.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {withdrawalOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMinWithdrawal(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedMinWithdrawal === option.value
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                        }`}
                        disabled={isUpdating}
                      >
                        <div className="text-lg font-semibold">{option.label}</div>
                        <div className="text-sm opacity-75">Minimum</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowMinWithdrawalModal(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleMinWithdrawalUpdate}
                      className="flex-1"
                      disabled={!selectedMinWithdrawal || isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Set Minimum'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default Dashboard;