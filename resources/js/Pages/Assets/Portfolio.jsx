import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  ArrowLeft,
  Download,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';

const AssetsPortfolio = ({ 
  portfolioSummary = {}, 
  userAssets = [], 
  performanceData = [],
  allocation = []
}) => {
  const [timeframe, setTimeframe] = useState('7d');

  const timeframes = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: '1y', label: '1Y' },
  ];

  const allocationColors = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600',
    'from-yellow-500 to-orange-600',
  ];

  return (
    <CryptoAIAuthLayout title="Portfolio - CryptoAI">
      <Head title="Portfolio" />
      
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href={route('assets.index')}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Assets
                </Button>
              </Link>
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">Portfolio Details</h1>
                <p className="text-gray-400">Comprehensive view of your holdings and performance</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    {portfolioSummary.formatted_total_value || '$0.00'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {portfolioSummary.day_change_percentage >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                )}
                <span className={`text-sm ${
                  portfolioSummary.day_change_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolioSummary.day_change_percentage >= 0 ? '+' : ''}
                  {Number(portfolioSummary.day_change_percentage || 0).toFixed(2)}% (24h)
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${
                    portfolioSummary.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {portfolioSummary.formatted_total_pnl || '$0.00'}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${
                  portfolioSummary.total_pnl >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600'
                }`}>
                  {portfolioSummary.total_pnl >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  portfolioSummary.total_pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolioSummary.total_pnl_percentage >= 0 ? '+' : ''}
                  {Number(portfolioSummary.total_pnl_percentage || 0).toFixed(2)}%
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Best Performer</p>
                  <p className="text-lg font-bold text-green-400">
                    {portfolioSummary.best_performer?.symbol || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                <span className="text-sm text-green-400">
                  +{Number(portfolioSummary.best_performer?.change || 0).toFixed(2)}%
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Worst Performer</p>
                  <p className="text-lg font-bold text-red-400">
                    {portfolioSummary.worst_performer?.symbol || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-600">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 mr-1 text-red-400" />
                <span className="text-sm text-red-400">
                  {Number(portfolioSummary.worst_performer?.change || 0).toFixed(2)}%
                </span>
              </div>
            </Card>
          </div>

          {/* Performance and Allocation Row */}
          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
            {/* Performance Chart */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Portfolio Performance</h2>
                <div className="flex space-x-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.key}
                      onClick={() => setTimeframe(tf.key)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        timeframe === tf.key
                          ? 'bg-cyan-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Placeholder for performance chart */}
              <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">Performance chart will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {timeframe.toUpperCase()} performance data
                  </p>
                </div>
              </div>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Asset Allocation</h2>
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4" />
                </Button>
              </div>
              
              {allocation.length > 0 ? (
                <div className="space-y-4">
                  {allocation.map((item, index) => (
                    <div key={item.symbol} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${
                          allocationColors[index % allocationColors.length]
                        } mr-3`}></div>
                        <div>
                          <p className="text-white font-medium">{item.symbol}</p>
                          <p className="text-sm text-gray-400">{item.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{item.percentage}%</p>
                        <p className="text-sm text-gray-400">{item.formatted_value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <PieChart className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-400">No allocation data available</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Holdings Table */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Detailed Holdings</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </div>
            
            {userAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 font-medium text-left text-gray-400">Asset</th>
                      <th className="py-3 font-medium text-left text-gray-400">Price</th>
                      <th className="py-3 font-medium text-left text-gray-400">Holdings</th>
                      <th className="py-3 font-medium text-left text-gray-400">Market Value</th>
                      <th className="py-3 font-medium text-left text-gray-400">Avg Buy Price</th>
                      <th className="py-3 font-medium text-left text-gray-400">P&L</th>
                      <th className="py-3 font-medium text-left text-gray-400">Allocation</th>
                      <th className="py-3 font-medium text-left text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAssets.map((asset) => (
                      <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {asset.symbol?.substring(0, 2) || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{asset.name}</p>
                              <p className="text-sm text-gray-400">{asset.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-white">{asset.formatted_price}</td>
                        <td className="py-4 text-white">{asset.formatted_amount}</td>
                        <td className="py-4 text-white font-semibold">{asset.formatted_value}</td>
                        <td className="py-4 text-gray-300">{asset.formatted_avg_buy_price}</td>
                        <td className="py-4">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              asset.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.formatted_pnl}
                            </p>
                            <p className={`text-sm ${
                              asset.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.pnl_percentage >= 0 ? '+' : ''}{Number(asset.pnl_percentage || 0).toFixed(2)}%
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-white">{asset.allocation_percentage}%</td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Link href={route('assets.show', asset.id)}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={route('withdrawals.create', { asset_id: asset.id })}>
                              <Button size="sm" variant="ghost">
                                <ArrowUpRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No holdings found</h3>
                <p className="text-gray-400 mb-6">Start building your portfolio</p>
                <Link href={route('deposits.create')}>
                  <Button>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Deposit
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default AssetsPortfolio;
