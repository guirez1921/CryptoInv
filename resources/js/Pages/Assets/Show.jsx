import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  Star,
  StarOff,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Info,
  Globe,
  ExternalLink,
  Clock,
  Wallet,
  Activity,
  Copy,
  CheckCircle
} from 'lucide-react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';

const AssetsShow = ({ 
  asset = {}, 
  priceHistory = [],
  userHolding = null,
  marketStats = {},
  isWatchlisted = false,
  relatedAssets = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('7d');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const timeframes = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: '1y', label: '1Y' },
  ];

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num?.toFixed(2) || '0';
  };

  return (
    <CryptoAIAuthLayout title={`${asset.name} - CryptoAI`}>
      <Head title={asset.name} />
      
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
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">
                    {asset.symbol?.substring(0, 2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
                  <p className="text-gray-400">{asset.symbol} • {asset.network}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button 
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  isWatchlisted
                    ? 'bg-yellow-600 border-yellow-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {isWatchlisted ? (
                  <Star className="w-5 h-5 mr-2 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5 mr-2" />
                )}
                {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>

          {/* Price Overview */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                <p className="text-3xl font-bold text-white mb-2">
                  {asset.formatted_price || 'N/A'}
                </p>
                <div className="flex items-center">
                  {asset.change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.change_24h >= 0 ? '+' : ''}{Number(asset.change_24h || 0).toFixed(2)}% (24h)
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm text-gray-400">Market Cap</p>
                <p className="text-2xl font-bold text-white">
                  {asset.formatted_market_cap || 'N/A'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Rank #{asset.market_cap_rank || 'N/A'}
                </p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm text-gray-400">24h Volume</p>
                <p className="text-2xl font-bold text-white">
                  {asset.formatted_volume_24h || 'N/A'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Vol/MCap: {((asset.volume_24h / asset.market_cap) * 100).toFixed(2)}%
                </p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm text-gray-400">Circulating Supply</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(asset.circulating_supply)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {asset.max_supply ? `Max: ${formatNumber(asset.max_supply)}` : 'No max supply'}
                </p>
              </div>
            </Card>
          </div>

          {/* User Holdings Card (if user has this asset) */}
          {userHolding && (
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Holdings</h2>
                <div className="flex space-x-2">
                  <Link href={route('deposits.create')} data={{ asset_id: asset.id }}>
                    <Button size="sm">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                  </Link>
                  <Link href={route('withdrawals.create')} data={{ asset_id: asset.id }}>
                    <Button size="sm" variant="outline">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-400">Holdings</p>
                  <p className="text-xl font-bold text-white">{userHolding.formatted_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Market Value</p>
                  <p className="text-xl font-bold text-white">{userHolding.formatted_value}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">P&L</p>
                  <div>
                    <p className={`text-xl font-bold ${
                      userHolding.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {userHolding.formatted_pnl}
                    </p>
                    <p className={`text-sm ${
                      userHolding.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {userHolding.pnl_percentage >= 0 ? '+' : ''}{Number(userHolding.pnl_percentage || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Price Statistics */}
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Price Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">All-Time High</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{asset.formatted_ath || 'N/A'}</p>
                      <p className="text-sm text-red-400">
                        {asset.ath_change_percentage ? `${asset.ath_change_percentage.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">All-Time Low</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{asset.formatted_atl || 'N/A'}</p>
                      <p className="text-sm text-green-400">
                        {asset.atl_change_percentage ? `+${asset.atl_change_percentage.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">52W High</span>
                    <span className="text-white font-semibold">{asset.formatted_high_52w || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">52W Low</span>
                    <span className="text-white font-semibold">{asset.formatted_low_52w || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {/* Market Information */}
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Market Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="text-white font-semibold">
                      {asset.total_supply ? formatNumber(asset.total_supply) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Supply</span>
                    <span className="text-white font-semibold">
                      {asset.max_supply ? formatNumber(asset.max_supply) : '∞'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Dominance</span>
                    <span className="text-white font-semibold">
                      {asset.market_dominance ? `${asset.market_dominance.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white font-semibold">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {asset.last_updated ? new Date(asset.last_updated).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'chart' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Price Chart</h2>
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
              
              {/* Placeholder for price chart */}
              <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">Price chart will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {timeframe.toUpperCase()} price data for {asset.symbol}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Asset Information */}
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Asset Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Description</p>
                    <p className="text-white text-sm leading-relaxed">
                      {asset.description || 'No description available for this asset.'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                    {asset.contract_address ? (
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-800 px-3 py-1 rounded text-sm text-cyan-400 flex-1">
                          {asset.contract_address}
                        </code>
                        <button
                          onClick={() => handleCopyAddress(asset.contract_address)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedAddress ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No contract address available</p>
                    )}
                  </div>

                  {asset.website && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Official Website</p>
                      <a
                        href={asset.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {asset.website}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Trading Actions */}
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Trading Actions</h3>
                <div className="space-y-4">
                  {asset.supports_deposits && (
                    <Link href={route('deposits.create')} data={{ asset_id: asset.id }}>
                      <Button className="w-full">
                        <ArrowDownRight className="w-5 h-5 mr-2" />
                        Deposit {asset.symbol}
                      </Button>
                    </Link>
                  )}
                  
                  {userHolding && (
                    <Link href={route('withdrawals.create')} data={{ asset_id: asset.id }}>
                      <Button variant="outline" className="w-full">
                        <ArrowUpRight className="w-5 h-5 mr-2" />
                        Withdraw {asset.symbol}
                      </Button>
                    </Link>
                  )}

                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-sm text-gray-400 mb-2">Quick Stats</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Network</p>
                        <p className="text-white font-medium">{asset.network}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Decimals</p>
                        <p className="text-white font-medium">{asset.decimals || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          asset.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {asset.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400">Deposits</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          asset.supports_deposits ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {asset.supports_deposits ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Related Assets */}
          {relatedAssets.length > 0 && (
            <Card className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Related Assets</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {relatedAssets.map((relatedAsset) => (
                  <Link
                    key={relatedAsset.id}
                    href={route('assets.show', relatedAsset.id)}
                    className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {relatedAsset.symbol?.substring(0, 2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{relatedAsset.name}</p>
                      <p className="text-sm text-gray-400">{relatedAsset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{relatedAsset.formatted_price}</p>
                      <p className={`text-sm ${
                        relatedAsset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {relatedAsset.change_24h >= 0 ? '+' : ''}{Number(relatedAsset.change_24h || 0).toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default AssetsShow;
