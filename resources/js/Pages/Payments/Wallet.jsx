import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Copy,
    CheckCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Plus,
    RefreshCw,
    Shield,
    Key,
    X
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Card from '@/component/UI/Card';
import Button from '@/component/UI/Button';

const WalletPage = () => {
    const { wallet, addresses, groupedAddresses, user, error } = usePage().props;
    const [copied, setCopied] = useState('');
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [mnemonic, setMnemonic] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mnemonicError, setMnemonicError] = useState('');
    const [selectedChain, setSelectedChain] = useState('');
    const [expandedChains, setExpandedChains] = useState({});

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopied(address);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleExportMnemonic = async (e) => {
        e.preventDefault();

        if (!password) {
            setMnemonicError('Please enter your password');
            return;
        }

        setLoading(true);
        setMnemonicError('');

        try {
            const response = await fetch(route('wallet.exportMnemonic'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                setMnemonic(data.mnemonic);
                setPassword('');
                setShowMnemonic(true);
            } else {
                setMnemonicError(data.message || 'Failed to export mnemonic');
            }
        } catch (error) {
            console.error('Error exporting mnemonic:', error);
            setMnemonicError('Failed to export mnemonic. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleChain = (chain) => {
        setExpandedChains(prev => ({
            ...prev,
            [chain]: !prev[chain]
        }));
    };

    const getChainIcon = (chain) => {
        // You can customize these icons based on the chain
        const icons = {
            ethereum: '⟠',
            bitcoin: '₿',
            solana: '◎',
            tron: 'T',
            polygon: '⬣',
            bsc: 'Ƀ',
        };
        return icons[chain.toLowerCase()] || '🔗';
    };

    if (error) {
        return (
            <CryptoAIAuthLayout title="Wallet - CryptoAI">
                <div className="min-h-screen bg-gray-900 py-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card>
                            <div className="text-center py-12">
                                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Wallet Not Available</h2>
                                <p className="text-gray-400">{error}</p>
                                <Button
                                    className="mt-4"
                                    onClick={() => router.get(route('dashboard'))}
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </CryptoAIAuthLayout>
        );
    }

    return (
        <CryptoAIAuthLayout title="HD Wallet - CryptoAI">
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">HD Wallet</h1>
                        <p className="text-gray-400">Manage your multi-chain cryptocurrency wallet</p>
                    </div>

                    {/* Wallet Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Wallet Status</p>
                                    <p className="text-2xl font-bold text-white capitalize">{wallet?.status || 'Unknown'}</p>
                                </div>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${wallet?.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                        wallet?.status === 'locked' ? 'bg-gradient-to-r from-red-500 to-orange-600' :
                                            'bg-gradient-to-r from-yellow-500 to-orange-600'
                                    }`}>
                                    {wallet?.is_locked ? <Lock className="w-6 h-6 text-white" /> : <Unlock className="w-6 h-6 text-white" />}
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Addresses</p>
                                    <p className="text-2xl font-bold text-white">{wallet?.address_count || 0}</p>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Wallet Type</p>
                                    <p className="text-2xl font-bold text-white capitalize">{wallet?.type || 'Spot'}</p>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Created</p>
                                    <p className="text-lg font-bold text-white">{wallet?.created_at || 'Unknown'}</p>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                                    <Key className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Security Warning */}
                    <Card className="mb-8 bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-start">
                            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 mr-4 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-yellow-200 mb-2">Important Security Information</p>
                                <p className="text-sm text-yellow-100/80">
                                    Your HD wallet uses a single mnemonic phrase to generate all addresses across multiple chains.
                                    Never share your mnemonic phrase with anyone. Store it securely offline. Anyone with access to your
                                    mnemonic can access all funds in your wallet.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Mnemonic Export Section */}
                    <Card className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Key className="w-6 h-6 text-cyan-400 mr-3" />
                                <h2 className="text-xl font-bold text-white">Recovery Phrase</h2>
                            </div>
                        </div>

                        {!showMnemonic ? (
                            <form onSubmit={handleExportMnemonic}>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                                    <div className="flex items-start">
                                        <Shield className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div className="text-sm text-red-200">
                                            <p className="font-semibold mb-1">One-Time Export Only!</p>
                                            <p>For security reasons, your mnemonic phrase will only be displayed once. Make sure to save it in a secure location.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Enter your password to export mnemonic
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        {mnemonicError && (
                                            <p className="text-red-400 text-sm mt-2">{mnemonicError}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading || !password}
                                        className="w-full"
                                    >
                                        {loading ? 'Verifying...' : 'Export Mnemonic Phrase'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-semibold text-red-200">Your 12-Word Recovery Phrase:</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyAddress(mnemonic)}
                                        >
                                            {copied === mnemonic ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {mnemonic.split(' ').map((word, index) => (
                                            <div key={index} className="bg-gray-800 rounded p-2 text-center">
                                                <span className="text-xs text-gray-400 mr-2">{index + 1}.</span>
                                                <span className="text-white font-mono">{word}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMnemonic(false)}
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Addresses by Chain */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Wallet Addresses</h2>
                            <p className="text-sm text-gray-400">{addresses?.length || 0} addresses</p>
                        </div>

                        {groupedAddresses && groupedAddresses.length > 0 ? (
                            <div className="space-y-4">
                                {groupedAddresses.map((group) => (
                                    <div key={group.chain} className="border border-gray-700 rounded-lg overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                                            onClick={() => toggleChain(group.chain)}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">{getChainIcon(group.chain)}</span>
                                                <div>
                                                    <p className="font-semibold text-white capitalize">{group.chain}</p>
                                                    <p className="text-sm text-gray-400">{group.addresses.length} address(es)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <p className="text-sm text-gray-400 mr-4">
                                                    Balance: {parseFloat(group.total_balance).toFixed(8)}
                                                </p>
                                                {expandedChains[group.chain] ? (
                                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {expandedChains[group.chain] && (
                                            <div className="p-4 bg-gray-900/50 space-y-3">
                                                {group.addresses.map((addr) => (
                                                    <div key={addr.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-1">
                                                                <code className="text-cyan-400 text-sm break-all">{addr.address}</code>
                                                                {addr.asset && (
                                                                    <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                                                        {addr.asset}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                Balance: {parseFloat(addr.balance).toFixed(8)} | Created: {addr.created_at}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCopyAddress(addr.address)}
                                                            className="ml-4 flex-shrink-0"
                                                        >
                                                            {copied === addr.address ? (
                                                                <CheckCircle className="w-4 h-4" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No addresses found</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </CryptoAIAuthLayout>
    );
};

export default WalletPage;
