import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    Wallet,
    ArrowLeft,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    DollarSign,
    TrendingUp,
    Copy,
    Activity,
    MessageSquare,
    Plus,
    Lock,
    Unlock,
    Send,
    Shield,
    Clock,
    Key
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Card from '@/component/UI/Card';
import Button from '@/component/UI/Button';
import ViewMnemonicModal from '@/Component/Admin/ViewMnemonicModal';

const UserDetail = () => {
    const { user, wallet, auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState('');
    const [expandedChains, setExpandedChains] = useState({});
    const [showMnemonicModal, setShowMnemonicModal] = useState(false);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const messagesEndRef = useRef(null);
    const currentAdmin = auth?.user;

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopied(address);
        setTimeout(() => setCopied(''), 2000);
    };

    const toggleChain = (chain) => {
        setExpandedChains(prev => ({
            ...prev,
            [chain]: !prev[chain]
        }));
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
        return icons[chain.toLowerCase()] || '🔗';
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/20 text-green-400',
            pending: 'bg-yellow-500/20 text-yellow-400',
            failed: 'bg-red-500/20 text-red-400',
        };
        return styles[status] || 'bg-gray-500/20 text-gray-400';
    };

    // Load chat history when chat tab is opened
    useEffect(() => {
        if (activeTab === 'chat' && messages.length === 0) {
            loadChatHistory();
        }
    }, [activeTab]);

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Echo integration
    useEffect(() => {
        if (activeTab === 'chat' && window.Echo && user.id) {
            const channel = window.Echo.private(`chat.${user.id}`);

            channel.listen('.message.sent', (e) => {
                setMessages(prev => {
                    if (prev.some(msg => msg.id === e.chat.id)) return prev;
                    return [...prev, e.chat];
                });
            });

            return () => {
                if (window.Echo) {
                    window.Echo.leaveChannel(`chat.${user.id}`);
                }
            };
        }
    }, [activeTab, user.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        setIsLoadingChat(true);
        try {
            const response = await fetch(route('admin.chat.history', user.id));
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load chat:', error);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const tempMsg = {
            id: Date.now(),
            message: newMessage.trim(),
            is_from_admin: true,
            created_at: new Date().toISOString(),
            sending: true,
            admin: { user: currentAdmin }
        };

        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch(route('admin.chat.send', user.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message: tempMsg.message })
            });

            if (!response.ok) throw new Error('Failed');

            setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
        } finally {
            setIsSending(false);
        }
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <CryptoAIAuthLayout title={`User: ${user.name} - Admin`}>
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('admin.dashboard'))}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    {/* User Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                                    <div className="flex items-center space-x-4 text-gray-400">
                                        <span className="flex items-center">
                                            <Mail className="w-4 h-4 mr-1" />
                                            {user.email}
                                        </span>
                                        <span className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Joined {user.created_at}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {user.is_active ? (
                                            <span className="flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                                                <XCircle className="w-4  h-4 mr-1" />
                                                Inactive
                                            </span>
                                        )}
                                        {user.email_verified_at && (
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                                                Verified
                                            </span>
                                        )}
                                        {wallet?.is_locked && (
                                            <span className="flex items-center px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                                                <Lock className="w-4 h-4 mr-1" />
                                                Wallet Locked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                    <Plus className="w-4 h-4 mr-1" />

                                    Deposit
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setShowMnemonicModal(true)}>
                                    <Key className="w-4 h-4 mr-1" />
                                    View Mnemonic
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('chat')}>
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Message
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Balance Cards */}
                    {user.account && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Total Balance</p>
                                        <p className="text-2xl font-bold text-white">
                                            ${user.account.total_balance?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                    <DollarSign className="w-10 h-10 text-cyan-400" />
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Available</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            ${user.account.available_balance?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                    <Wallet className="w-10 h-10 text-green-400" />
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Invested</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            ${user.account.invested_balance?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-purple-400" />
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Profit/Loss</p>
                                        <p className={`text-2xl font-bold ${(user.account.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            ${user.account.profit_loss?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                    <Activity className="w-10 h-10 text-orange-400" />
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('wallet')}
                            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'wallet'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Wallet className="w-4 h-4 inline mr-2" />
                            Wallet & Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'transactions'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Activity className="w-4 h-4 inline mr-2" />
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Chat
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Account Info */}
                            <Card>
                                <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400">User ID</p>
                                        <p className="text-white font-medium">{user.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Email Verified</p>
                                        <p className="text-white font-medium">
                                            {user.email_verified_at || 'Not verified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Status</p>
                                        <p className="text-white font-medium">
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Joined Date</p>
                                        <p className="text-white font-medium">{user.created_at}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Recent Transactions */}
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setActiveTab('transactions')}
                                    >
                                        View All
                                    </Button>
                                </div>
                                {user.recent_transactions && user.recent_transactions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                                                    <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                                                    <th className="text-left py-3 text-gray-400 font-medium">Chain</th>
                                                    <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                                                    <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {user.recent_transactions.map((tx) => (
                                                    <tr key={tx.id} className="border-b border-gray-800">
                                                        <td className="py-3 text-white capitalize">{tx.type}</td>
                                                        <td className="py-3 text-white font-semibold">${tx.amount}</td>
                                                        <td className="py-3 text-gray-300 uppercase">{tx.chain}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(tx.status)}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-gray-400 text-sm">{tx.created_at}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-8">No transactions yet</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-6">HD Wallet & Addresses</h3>

                            {wallet ? (
                                <div className="space-y-6">
                                    {/* Wallet Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-400">Wallet Status</p>
                                            <p className="text-white font-medium capitalize">{wallet.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Total Addresses</p>
                                            <p className="text-white font-medium">{wallet.address_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Wallet Type</p>
                                            <p className="text-white font-medium capitalize">{wallet.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Created</p>
                                            <p className="text-white font-medium">{wallet.created_at}</p>
                                        </div>
                                    </div>

                                    {/* Addresses by Chain */}
                                    {wallet.grouped_addresses && wallet.grouped_addresses.length > 0 ? (
                                        <div className="space-y-4">
                                            {wallet.grouped_addresses.map((group) => (
                                                <div key={group.chain} className="border border-gray-700 rounded-lg overflow-hidden">
                                                    <div
                                                        className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70"
                                                        onClick={() => toggleChain(group.chain)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="text-2xl mr-3">{getChainIcon(group.chain)}</span>
                                                            <div>
                                                                <p className="font-semibold text-white capitalize">{group.chain}</p>
                                                                <p className="text-sm text-gray-400">{group.addresses.length} address(es)</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-400">
                                                            Balance: {parseFloat(group.total_balance).toFixed(8)}
                                                        </p>
                                                    </div>

                                                    {expandedChains[group.chain] && (
                                                        <div className="p-4 bg-gray-900/50 space-y-3">
                                                            {group.addresses.map((addr) => (
                                                                <div key={addr.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center mb-1">
                                                                            <code className="text-cyan-400 text-sm">{addr.address}</code>
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
                                                                        className="ml-4"
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
                                        <p className="text-gray-400 text-center py-8">No addresses found</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No HD wallet found for this user</p>
                            )}
                        </Card>
                    )}

                    {activeTab === 'transactions' && (
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-6">Transaction History</h3>
                            <p className="text-gray-400 text-center py-8">
                                Transaction history with advanced filtering coming soon...
                            </p>
                        </Card>
                    )}

                    {activeTab === 'chat' && (
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-6">Chat with {user.name}</h3>

                            <div className="flex flex-col h-[600px]">
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 bg-gray-900/30 rounded-lg mb-4">
                                    {isLoadingChat ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-400">Loading chat history...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <MessageSquare className="w-12 h-12 text-gray-500 mb-3" />
                                            <p className="text-gray-400 text-sm">No messages yet</p>
                                            <p className="text-gray-500 text-xs mt-1">Start a conversation with {user.name}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((msg, index) => {
                                                const isFromAdmin = msg.is_from_admin;
                                                const text = msg.message || msg.content || '';
                                                const sender = isFromAdmin
                                                    ? (msg.admin?.user || msg.admin || currentAdmin)
                                                    : (msg.user || { name: user.name });

                                                return (
                                                    <div
                                                        key={msg.id || index}
                                                        className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-md px-4 py-2 rounded-lg ${isFromAdmin
                                                            ? 'bg-gradient-to-r from-purple-500/80 to-pink-600/80 text-white'
                                                            : 'bg-gray-700 text-gray-100'
                                                            } ${msg.sending ? 'opacity-60' : ''}`}>
                                                            {!isFromAdmin && (
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <User className="w-3 h-3" />
                                                                    <span className="text-xs font-medium text-gray-300">
                                                                        {sender?.name || user.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {isFromAdmin && (
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Shield className="w-3 h-3" />
                                                                    <span className="text-xs font-medium">
                                                                        {sender?.name || 'You'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <p className="text-sm">{text}</p>
                                                            <div className="flex items-center justify-end mt-1 space-x-1">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-400">
                                                                    {formatMessageTime(msg.created_at)}
                                                                </span>
                                                                {msg.sending && (
                                                                    <span className="text-xs text-gray-400 ml-2">Sending...</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                                        disabled={isSending}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="px-6 py-3"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {isSending ? 'Sending...' : 'Send'}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {
                showMnemonicModal && (
                    <ViewMnemonicModal
                        user={user}
                        onClose={() => setShowMnemonicModal(false)}
                    />
                )
            }
        </CryptoAIAuthLayout >
    );
};

export default UserDetail;
