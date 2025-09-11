import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  ArrowLeft,
  Star,
  StarOff,
  BarChart3,
  DollarSign,
  Eye,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  Globe
} from 'lucide-react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';

const AssetsMarket = ({ 
  marketAssets = [], 
  marketStats = {},
  categories = [],
  watchlist = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showOnlyWatchlist, setShowOnlyWatchlist] = useState(false);

  // Filter and sort assets
  const filteredAssets = marketAssets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesWatchlist = !showOnlyWatchlist || watchlist.includes(asset.id);
      
      return matchesSearch && matchesCategory && matchesWatchlist;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

  const sortOptions = [
    { key: 'market_cap', label: 'Market Cap' },
    { key: 'price', label: 'Price' },
    { key: 'change_24h', label: '24h Change' },
    { key: 'volume_24h', label: '24h Volume' },
    { key: 'name', label: 'Name' },
  ];

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <CryptoAIAuthLayout title="Market - CryptoAI">
      <Head title="Market" />
      
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
                <h1 className="mb-2 text-3xl font-bold text-white">Cryptocurrency Market</h1>
                <p className="text-gray-400">Explore and track market data for all available cryptocurrencies</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    {marketStats.total_market_cap || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm flex items-center ${
                  marketStats.market_cap_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {marketStats.market_cap_change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {marketStats.market_cap_change_24h >= 0 ? '+' : ''}
                  {Number(marketStats.market_cap_change_24h || 0).toFixed(2)}% (24h)
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">24h Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {marketStats.total_volume_24h || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Trading volume</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Coins</p>
                  <p className="text-2xl font-bold text-white">
                    {marketStats.active_cryptocurrencies || 0}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">Listed cryptocurrencies</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Market Dominance</p>
                  <p className="text-2xl font-bold text-white">
                    BTC {Number(marketStats.btc_dominance || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-400">
                  ETH {Number(marketStats.eth_dominance || 0).toFixed(1)}%
                </span>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      Sort by {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Watchlist Filter */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowOnlyWatchlist(!showOnlyWatchlist)}
                  className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                    showOnlyWatchlist
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {showOnlyWatchlist ? (
                    <Star className="w-5 h-5 mr-2 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5 mr-2" />
                  )}
                  Watchlist Only
                </button>
              </div>
            </div>
          </Card>

          {/* Market Table */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Market Data ({filteredAssets.length} assets)
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>
            
            {filteredAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 font-medium text-left text-gray-400">#</th>
                      <th className="py-3 font-medium text-left text-gray-400">Asset</th>
                      <th 
                        className="py-3 font-medium text-left text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('price')}
                      >
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="py-3 font-medium text-left text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('change_24h')}
                      >
                        24h Change {sortBy === 'change_24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="py-3 font-medium text-left text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('market_cap')}
                      >
                        Market Cap {sortBy === 'market_cap' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="py-3 font-medium text-left text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('volume_24h')}
                      >
                        24h Volume {sortBy === 'volume_24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 font-medium text-left text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset, index) => (
                      <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 text-gray-400">{index + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {asset.symbol?.substring(0, 2) || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{asset.name}</p>
                              <p className="text-sm text-gray-400">
                                {asset.symbol} • {asset.network}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-white">{asset.formatted_price || 'N/A'}</td>
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
                        <td className="py-4 text-white">{asset.formatted_market_cap || 'N/A'}</td>
                        <td className="py-4 text-white">{asset.formatted_volume_24h || 'N/A'}</td>
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
                            <button 
                              className={`p-2 rounded transition-colors ${
                                watchlist.includes(asset.id)
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-gray-400 hover:text-yellow-400'
                              }`}
                            >
                              {watchlist.includes(asset.id) ? (
                                <Star className="w-4 h-4 fill-current" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </button>
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
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default AssetsMarket;
