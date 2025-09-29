import React, { useState, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import QRCodeLib from 'qrcode';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Card from '@/component/UI/Card';
import Button from '@/component/UI/Button';

const PaymentIndex = () => {
  const { history, totals, user, account, accountId } = usePage().props;
  const [activeTab, setActiveTab] = useState('deposit');
  const [supportedChains, setSupportedChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState('');
  const [amount, setAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawChain, setWithdrawChain] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addressGenerated, setAddressGenerated] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [open, setOpen] = useState(false);

  // Get data from props
  const availableBalance = account?.balance || 0;
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(50000);
  const canWithdraw = availableBalance >= minimumWithdrawal;

  // Fetch minimum withdrawal from server on mount
  useEffect(() => {
    let mounted = true;
    const fetchMin = async () => {
      try {
        const res = await fetch(route('settings.getMinWithdrawal'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log(data);
        const val = data.min_withdrawal ?? data.minWithdrawal ?? data.min ?? 50000;
        if (mounted) setMinimumWithdrawal(Number(val));
      } catch (err) {
        console.error('Error fetching minimum withdrawal:', err);
        // keep default fallback of 50000
      }
    };
    fetchMin();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchSupportedChains();
  }, []);

  useEffect(() => {
    // generate QR data URL when depositAddress is set and QR is requested
    let mounted = true;
    const gen = async () => {
      if (showQRCode && depositAddress) {
        try {
          const dataUrl = await QRCodeLib.toDataURL(depositAddress, { margin: 1, width: 160, errorCorrectionLevel: 'H' });
          if (mounted) setQrDataUrl(dataUrl);
        } catch (err) {
          console.error('QR generation error', err);
          if (mounted) setQrDataUrl('');
        }
      } else {
        if (mounted) setQrDataUrl('');
      }
    };
    gen();
    return () => { mounted = false; };
  }, [showQRCode, depositAddress]);

  const fetchSupportedChains = async () => {
    setLoading(true);
    try {
      const response = await fetch(route('payments.supportedChains'), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSupportedChains(data.chains || []);
        if (data.chains && data.chains.length > 0) {
          setSelectedChain(data.chains[0].key);
          setWithdrawChain(data.chains[0].key);
        }
      }
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      // Fallback mock data
      const mockChains = [
        {
          key: "bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          decimals: 8,
          minDeposit: 0.001,
          withdrawalFee: 0.0005,
          chainId: null,
          coinType: 0,
          chainType: "utxo",
          derivationPath: "m/44'/0'/0'/0/",
          rpcUrl: "configured"
        },
        {
          key: "ethereum",
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          minDeposit: 0.01,
          withdrawalFee: 0.005,
          chainId: 1,
          coinType: 60,
          chainType: "evm",
          derivationPath: "m/44'/60'/0'/0/",
          rpcUrl: "configured"
        }
      ];
      setSupportedChains(mockChains);
      setSelectedChain(mockChains[0].key);
      setWithdrawChain(mockChains[0].key);
    }
    setLoading(false);
  };

  const generateDepositAddress = async () => {
    if (!accountId || !selectedChain) return;

    setLoading(true);
    try {
      const response = await fetch(route('payments.getDepositAddress', { chain: selectedChain }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(response);
        const data = await response.json();
        if (data.success) {
          setDepositAddress(data.depositAddress);
          setAddressGenerated(true);
          console.log(data);
        }
      }
    } catch (error) {
      console.error('Error generating deposit address:', error);
    }
    setLoading(false);
  };

  const handleCopyAddress = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!amount || !selectedChain) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      router.post('/payments/deposit', {
        amount: parseFloat(amount),
        chain: selectedChain
      }, {
        onSuccess: async () => {
          // start monitoring the deposit address if we have one
          try {
            if (depositAddress) {
              await fetch(route('payments.startDepositMonitoring'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: depositAddress, chain: selectedChain })
              });
            }
          } catch (err) {
            console.error('Failed to start deposit monitoring', err);
          }

          setAmount('');
          setDepositAddress('');
          setAddressGenerated(false);
          alert('Deposit request submitted successfully!');
        },
        onError: (errors) => {
          console.error('Deposit error:', errors);
          alert('Failed to submit deposit request');
        },
        onFinish: () => setLoading(false)
      });
    } catch (error) {
      console.error('Error submitting deposit:', error);
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();

    if (!canWithdraw) {
      alert(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }

    const withdrawAmountFloat = parseFloat(withdrawAmount);

    if (withdrawAmountFloat > availableBalance) {
      alert('Insufficient balance');
      return;
    }

    // No maximum withdrawal quota enforced on the client; server will validate limits

    if (!withdrawAddress || !withdrawChain) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      router.post('/payments/withdraw', {
        amount: withdrawAmountFloat,
        address: withdrawAddress,
        chain: withdrawChain
      }, {
        onSuccess: () => {
          setWithdrawAmount('');
          setWithdrawAddress('');
          alert('Withdrawal request submitted successfully!');
        },
        onError: (errors) => {
          console.error('Withdrawal error:', errors);
          const errorMessage = Object.values(errors).flat().join(', ');
          alert(`Withdrawal failed: ${errorMessage}`);
        },
        onFinish: () => setLoading(false)
      });
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      setLoading(false);
    }
  };

  const getSelectedChainData = () => {
    return supportedChains.find(chain => chain.key === selectedChain);
  };

  const getWithdrawChainData = () => {
    return supportedChains.find(chain => chain.key === withdrawChain);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTransactionData = (transactions) => {
    if (!transactions || !transactions.data) return [];

    return transactions.data.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      crypto: tx.chain?.toUpperCase() || 'USD',
      chain: tx.chain || 'Unknown',
      status: tx.status,
      date: new Date(tx.created_at).toLocaleDateString(),
      txHash: tx.tx_hash
    }));
  };

  const transactionHistory = formatTransactionData(history);

  return (
    <CryptoAIAuthLayout title="Payments - CryptoAI">
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
            <p className="text-gray-400">Deposit and withdraw your cryptocurrency</p>
          </div>

          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${totals?.deposits?.toLocaleString() || '0.00'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-orange-400">
                    ${totals?.withdrawals?.toLocaleString() || '0.00'}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Minimum Withdrawal</p>
                  <p className="text-2xl font-bold text-white">
                    ${minimumWithdrawal.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${canWithdraw ? 'text-green-400' : 'text-red-400'}`}>
                  {canWithdraw ? 'Withdrawal Available' : 'Minimum Not Met'}
                </span>
              </div>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'deposit'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <ArrowDownRight className="w-4 h-4 mr-2 inline" />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'withdrawal'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <ArrowUpRight className="w-4 h-4 mr-2 inline" />
              Withdraw
            </button>
          </div>

          {/* Deposit Section */}
          {activeTab === 'deposit' && (
            <Card className="mb-8">
              <div className="flex items-center mb-6">
                <ArrowDownRight className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Deposit Cryptocurrency</h2>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">Important Warning:</p>
                    <p>Only send the selected cryptocurrency to the selected chain/address. Wrong funding is non-refundable. Deposits will be automatically discovered and added to your balance within 5 minutes.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Chain Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Chain
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => {
                      setSelectedChain(e.target.value);
                      setAddressGenerated(false);
                      setDepositAddress('');
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a chain</option>
                    {supportedChains.map(chain => (
                      <option key={chain.key} value={chain.key}>
                        {chain.name} ({chain.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount to Deposit (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={getSelectedChainData()?.minDeposit || 10}
                    step="0.01"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {getSelectedChainData() && (
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum deposit: ${getSelectedChainData().minDeposit || 10}
                    </p>
                  )}
                </div>

                {/* Generate Address Button */}
                {selectedChain && amount && !addressGenerated && (
                  <Button
                    onClick={generateDepositAddress}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Generating...' : 'Generate Deposit Address'}
                  </Button>
                )}

                {/* Wallet Address */}
                {addressGenerated && depositAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit Address ({getSelectedChainData()?.symbol})
                    </label>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-cyan-400 text-sm break-all">
                          {depositAddress}
                        </code>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyAddress}
                            className="flex-shrink-0"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="flex-shrink-0"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {showQRCode && depositAddress && (
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center">
                            {qrDataUrl ? (
                              <img src={qrDataUrl} alt={`QR for ${depositAddress}`} className="w-40 h-40 object-contain" />
                            ) : (
                              <div className="text-gray-500">Generating...</div>
                            )}
                          </div>
                          <p className="text-gray-800 text-xs mt-2 break-all">QR Code for: {depositAddress}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleDeposit}
                      disabled={loading}
                      className="w-full mt-4"
                      size="lg"
                    >
                      {loading ? 'Processing...' : 'Confirm Deposit'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Withdrawal Section */}
          {activeTab === 'withdrawal' && (
            <Card className="mb-8">
              <div className="flex items-center mb-6">
                <ArrowUpRight className="w-6 h-6 text-orange-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Withdraw Cryptocurrency</h2>
              </div>

              {!canWithdraw && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-200">
                      <p className="font-semibold mb-1">Withdrawal Requirements Not Met:</p>
                      <p>You need a minimum balance of ${minimumWithdrawal} to make a withdrawal. Your current available balance is ${availableBalance.toFixed(2)}.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Chain Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Chain
                  </label>
                  <select
                    value={withdrawChain}
                    onChange={(e) => setWithdrawChain(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a chain</option>
                    {supportedChains.map(chain => (
                      <option key={chain.key} value={chain.key}>
                        {chain.name} ({chain.symbol})
                      </option>
                    ))}
                  </select>
                  {getWithdrawChainData() && (
                    <p className="text-xs text-gray-400 mt-1">
                      Withdrawal fee: {getWithdrawChainData().withdrawalFee} {getWithdrawChainData().symbol}
                    </p>
                  )}
                </div>

                {/* Withdrawal Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Withdrawal Address
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="Enter destination wallet address"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount to Withdraw (USD)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min={minimumWithdrawal}
                    max={availableBalance}
                    step="0.01"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Available: ${availableBalance.toFixed(2)} | Minimum: ${minimumWithdrawal}
                  </p>
                </div>

                <Button
                  onClick={handleWithdrawal}
                  disabled={loading || !canWithdraw || !withdrawAmount || !withdrawAddress || !withdrawChain}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                </Button>
              </div>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <div className="text-sm text-gray-400">
                {history?.total || 0} transactions
              </div>
            </div>

            {transactionHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 font-medium text-gray-400">Amount</th>
                      <th className="text-left py-3 font-medium text-gray-400">Chain</th>
                      <th className="text-left py-3 font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 font-medium text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionHistory.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-orange-500/20'
                              }`}>
                              {tx.type === 'deposit' ? (
                                <TrendingDown className="w-4 h-4 text-green-400" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-orange-400" />
                              )}
                            </div>
                            <span className="text-white capitalize">{tx.type}</span>
                          </div>
                        </td>
                        <td className="py-4 text-white font-semibold">${tx.amount.toFixed(2)}</td>
                        <td className="py-4 text-gray-300">{tx.chain}</td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {getStatusIcon(tx.status)}
                            <span className={`ml-2 text-sm capitalize ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-400 text-sm">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No transaction history found
              </div>
            )}

            {/* Pagination */}
            {history && history.last_page > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-400">
                  Showing {history.from} to {history.to} of {history.total} results
                </div>
                <div className="flex space-x-2">
                  {history.prev_page_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.get(history.prev_page_url)}
                    >
                      Previous
                    </Button>
                  )}
                  {history.next_page_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.get(history.next_page_url)}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default PaymentIndex;