import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Wallet, 
  PieChart, 
  BarChart3, 
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';

const AssetsIndex = ({ 
  userAssets = [], 
  availableAssets = [], 
  marketOverview = {}, 
  portfolioSummary = {} 
}) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter assets based on search term
  const filteredUserAssets = userAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableAssets = availableAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CryptoAIAuthLayout title="Assets - CryptoAI">
      <Head title="Assets" />
      
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Assets</h1>
              <p className="text-gray-400">Manage your cryptocurrency portfolio</p>
            </div>
            <div className="flex space-x-4">
              <Link href={route('deposits.create')}>
                <Button>
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
              </Link>
              <Link href={route('withdrawals.create')}>
                <Button variant="outline">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </Link>
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Portfolio Value</p>
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
                  {Number(portfolioSummary.day_change_percentage || 0).toFixed(2)}% today
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Assets</p>
                  <p className="text-2xl font-bold text-white">{portfolioSummary.total_assets || 0}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Cryptocurrencies held</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Best Performer</p>
                  <p className="text-lg font-bold text-green-400">
                    {marketOverview.top_gainers?.[0]?.symbol || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                <span className="text-sm text-green-400">
                  +{Number(marketOverview.top_gainers?.[0]?.change_24h || 0).toFixed(2)}%
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    {marketOverview.total_market_cap || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Total crypto market</span>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Portfolio
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'market'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Market
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assets Content */}
          {activeTab === 'portfolio' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Portfolio</h2>
                <Link href={route('assets.portfolio')}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Detailed View
                  </Button>
                </Link>
              </div>
              
              {filteredUserAssets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 font-medium text-left text-gray-400">Asset</th>
                        <th className="py-3 font-medium text-left text-gray-400">Price</th>
                        <th className="py-3 font-medium text-left text-gray-400">Holdings</th>
                        <th className="py-3 font-medium text-left text-gray-400">Value</th>
                        <th className="py-3 font-medium text-left text-gray-400">24h Change</th>
                        <th className="py-3 font-medium text-left text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserAssets.map((asset) => (
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
                          <td className="py-4">
                            <span className={`flex items-center ${
                              asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.change_24h >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {asset.change_24h >= 0 ? '+' : ''}{Number(asset.change_24h || 0).toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Link href={route('assets.show', asset.id)}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
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
                  <h3 className="text-lg font-medium text-white mb-2">No assets in portfolio</h3>
                  <p className="text-gray-400 mb-6">Start by making your first deposit</p>
                  <Link href={route('deposits.create')}>
                    <Button>
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Make First Deposit
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'market' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Market Overview</h2>
                <Link href={route('assets.market')}>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Full Market
                  </Button>
                </Link>
              </div>
              
              {filteredAvailableAssets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 font-medium text-left text-gray-400">Asset</th>
                        <th className="py-3 font-medium text-left text-gray-400">Price</th>
                        <th className="py-3 font-medium text-left text-gray-400">24h Change</th>
                        <th className="py-3 font-medium text-left text-gray-400">Market Cap</th>
                        <th className="py-3 font-medium text-left text-gray-400">Volume</th>
                        <th className="py-3 font-medium text-left text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAvailableAssets.map((asset) => (
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
                                <p className="text-sm text-gray-400">{asset.symbol} • {asset.network}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-white">{asset.price}</td>
                          <td className="py-4">
                            <span className={`flex items-center ${
                              asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.change_24h >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {asset.change_24h >= 0 ? '+' : ''}{Number(asset.change_24h || 0).toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4 text-white">{asset.market_cap}</td>
                          <td className="py-4 text-white">{asset.volume_24h}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Link href={route('assets.show', asset.id)}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              {asset.supports_deposits && (
                                <Link href={route('deposits.create')} data={{ asset_id: asset.id }}>
                                  <Button size="sm">
                                    <DollarSign className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No assets found</h3>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default AssetsIndex;
