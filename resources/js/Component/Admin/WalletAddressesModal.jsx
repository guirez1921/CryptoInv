import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowUpRight, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import Button from '@/component/UI/Button';

const WalletAddressesModal = ({ user, onClose }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(null);
    const [copied, setCopied] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadWalletAddresses();
    }, [user.id]);

    const loadWalletAddresses = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await window.axios.get(route('admin.users.walletAddresses', user.id));
            setAddresses(response.data.addresses || []);
        } catch (err) {
            console.error('Error loading addresses:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTransferToMaster = async (address) => {
        if (!confirm(`Transfer all funds from ${address.address.substring(0, 10)}... to master wallet?`)) {
            return;
        }

        setTransferring(address.id);
        try {
            const response = await window.axios.post(route('admin.users.transferToMaster'), {
                user_id: user.id,
                address_id: address.id,
                chain: address.chain,
                asset: address.asset
            });

            alert('Transfer initiated successfully!');
            loadWalletAddresses(); // Reload to see updated balances
        } catch (err) {
            console.error('Transfer error:', err);
            alert(`Transfer failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setTransferring(null);
        }
    };

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopied(address);
        setTimeout(() => setCopied(''), 2000);
    };

    const getChainIcon = (chain) => {
        const icons = {
            ethereum: '⟠',
            bitcoin: '₿',
            solana: '◎',
            tron: 'T',
            polygon: '⬣',
            bsc: 'Ƀ',
        };
        return icons[chain?.toLowerCase()] || '🔗';
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Wallet Addresses</h3>
                            <p className="text-sm text-gray-400">{user.name} - {user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadWalletAddresses}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No wallet addresses found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-cyan-500/50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <span className="text-2xl">{getChainIcon(addr.chain)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="text-white font-semibold capitalize">{addr.chain}</p>
                                                    {addr.asset && (
                                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                                            {addr.asset}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <code className="text-cyan-400 text-sm font-mono truncate">
                                                        {addr.address}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopyAddress(addr.address)}
                                                        className="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                                                    >
                                                        {copied === addr.address ? (
                                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Balance</p>
                                            <p className="text-white font-semibold">
                                                {parseFloat(addr.balance || 0).toFixed(2)} {addr.asset || addr.chain?.toUpperCase()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">USD Value</p>
                                            <p className="text-white font-semibold">
                                                ${(addr.usd_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    {parseFloat(addr.balance || 0) > 0 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTransferToMaster(addr)}
                                            disabled={transferring === addr.id}
                                            className="w-full bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30"
                                        >
                                            <ArrowUpRight className="w-4 h-4 mr-2" />
                                            {transferring === addr.id ? 'Transferring...' : 'Transfer to Master'}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletAddressesModal;
