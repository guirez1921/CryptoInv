import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react"
import {
    QrCode,
    Copy,
    ExternalLink,
    ArrowDownRight,
    ArrowUpRight,
    Clock,
    Wallet,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Eye,
    EyeOff
} from "lucide-react";
import CryptoAIAuthLayout from "@/Layouts/CryptoAIAuthLayout";
import Deposit from "@/Component/Layout/Deposit";

// Mock components - replace with your actual components
const Card = ({ children, className = "" }) => (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, disabled = false, variant = "primary", className = "" }) => {
    const variants = {
        primary: "bg-cyan-600 hover:bg-cyan-700 text-white",
        secondary: "bg-gray-700 hover:bg-gray-600 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ label, error, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
        <input
            {...props}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
);

const Alert = ({ type, children }) => {
    const types = {
        error: "bg-red-900/50 border-red-700 text-red-300",
        success: "bg-green-900/50 border-green-700 text-green-300",
        warning: "bg-yellow-900/50 border-yellow-700 text-yellow-300",
        info: "bg-blue-900/50 border-blue-700 text-blue-300"
    };

    return (
        <div className={`border rounded-lg p-4 mb-4 ${types[type]}`}>
            {children}
        </div>
    );
};

const CRYPTO_CURRENCIES = [
    { symbol: "ETH", name: "Ethereum", minDeposit: 0.01, withdrawalFee: 0.005 },
    { symbol: "BTC", name: "Bitcoin", minDeposit: 0.001, withdrawalFee: 0.0005 },
    { symbol: "USDT", name: "Tether", minDeposit: 10, withdrawalFee: 5 }
];

export default function Payments() {
    const { historyGroup, totals, user, accountId, account, flash, auth } = usePage().props;

    const [activeTab, setActiveTab] = useState("deposit");
    const [selectedCrypto, setSelectedCrypto] = useState("ETH");
    const [depositMethod, setDepositMethod] = useState("wallet");

    // Deposit states
    const [depositAmount, setDepositAmount] = useState("");
    const [depositAddress, setDepositAddress] = useState("");
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isCheckingDeposit, setIsCheckingDeposit] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    // Withdrawal states
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawAddress, setWithdrawAddress] = useState("");
    const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

    // Wallet states
    const [walletInfo, setWalletInfo] = useState(null);
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    // Errors and messages
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Load wallet info on component mount
    useEffect(() => {
        if (accountId) {
            loadWalletInfo();
        }
    }, [accountId]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
        }
        if (flash?.error) {
            setErrors({ general: flash.error });
        }
    }, [flash]);
    console.log(usePage().props);

    const API_PORT = import.meta.env.VITE_PORT || 4000;
    const API_KEY = import.meta.env.VITE_API_KEY;
    const API_BASE = `http://localhost:${API_PORT}`;
    const API_HEADERS = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };

    const loadWalletInfo = async () => {
        if (!accountId) return;

        setIsLoadingWallet(true);
        try {
            const response = await fetch(`${API_BASE}/api/wallet/${accountId}`, {
                headers: API_HEADERS
            });

            if (response.ok) {
                const data = await response.json();
                setWalletInfo(data.wallet);
                setWalletBalance(parseFloat(data.wallet.balance));
                setDepositAddress(data.wallet.address);
            } else if (response.status === 404) {
                // Wallet doesn't exist, we'll show create wallet option
                setWalletInfo(null);
            }
        } catch (error) {
            console.error('Error loading wallet:', error);
            setErrors({ general: 'Failed to load wallet information' });
        } finally {
            setIsLoadingWallet(false);
        }
    };

    const createWallet = async () => {
        if (!accountId) return;

        setIsLoadingAddress(true);
        try {
            const response = await fetch(`${API_BASE}/api/wallet/new/${accountId}`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({ type: 'spot' })
            });

            const data = await response.json();

            if (data.success) {
                setWalletInfo(data.wallet);
                setDepositAddress(data.wallet.address);
                setSuccessMessage('Wallet created successfully!');
            } else {
                setErrors({ general: data.error });
            }
        } catch (error) {
            console.error('Error creating wallet:', error);
            setErrors({ general: 'Failed to create wallet' });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const checkDeposits = async () => {
        if (!accountId || !walletInfo) return;

        setIsCheckingDeposit(true);
        try {
            const response = await fetch(`${API_BASE}/api/deposit/${accountId}/check`, {
                method: 'POST',
                headers: API_HEADERS
            });

            const data = await response.json();

            if (data.success && data.deposit) {
                setWalletBalance(data.deposit.newBalance);
                setSuccessMessage(`New deposit detected: ${data.deposit.amount} ETH`);
                // Reload page to show updated history
                router.reload({ only: ['historyGroup', 'totals'] });
            } else {
                setSuccessMessage('No new deposits found');
            }
        } catch (error) {
            console.error('Error checking deposits:', error);
            setErrors({ general: 'Failed to check for deposits' });
        } finally {
            setIsCheckingDeposit(false);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!withdrawAmount || !withdrawAddress) {
            setErrors({ withdrawal: 'Please fill in all fields' });
            return;
        }

        if (parseFloat(withdrawAmount) <= 0) {
            setErrors({ withdrawal: 'Amount must be greater than 0' });
            return;
        }

        if (parseFloat(withdrawAmount) > walletBalance) {
            setErrors({ withdrawal: 'Insufficient balance' });
            return;
        }

        setIsProcessingWithdrawal(true);
        try {
            // Step 1: Initiate withdrawal
            const response = await fetch(`${API_BASE}/api/withdraw/${accountId}`, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({
                    amount: withdrawAmount,
                    toAddress: withdrawAddress
                })
            });

            const data = await response.json();

            if (data.success) {
                // Step 2: Execute withdrawal
                const executeResponse = await fetch(`${API_BASE}/api/withdraw/${data.transaction.id}/execute`, {
                    method: 'POST',
                    headers: API_HEADERS
                });

                const executeData = await executeResponse.json();

                if (executeData.success) {
                    setSuccessMessage(`Withdrawal completed! Transaction hash: ${executeData.transaction.hash}`);
                    setWithdrawAmount("");
                    setWithdrawAddress("");
                    loadWalletInfo(); // Refresh wallet balance
                    router.reload({ only: ['historyGroup', 'totals'] });
                } else {
                    setErrors({ withdrawal: executeData.error });
                }
            } else {
                setErrors({ withdrawal: data.error });
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            setErrors({ withdrawal: 'Failed to process withdrawal' });
        } finally {
            setIsProcessingWithdrawal(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setSuccessMessage('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <CryptoAIAuthLayout title="Payments - CryptoAI">
            <div className="min-h-screen py-8 bg-gray-900">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-white">Payments</h1>
                        <p className="text-gray-400">Manage your deposits and withdrawals</p>
                    </div>

                    {/* Flash Messages */}
                    {successMessage && (
                        <Alert type="success">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            {successMessage}
                        </Alert>
                    )}

                    {errors.general && (
                        <Alert type="error">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            {errors.general}
                        </Alert>
                    )}

                    {/* Tabs */}
                    <div className="flex w-fit p-1 mb-8 space-x-1 rounded-lg bg-gray-800/50">
                        {[
                            { id: "deposit", name: "Deposit", icon: ArrowDownRight },
                            { id: "withdraw", name: "Withdraw", icon: ArrowUpRight },
                            { id: "history", name: "History", icon: Clock },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-cyan-600 text-white"
                                        : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {activeTab === "deposit" && (
                                <Deposit accountId={accountId} />
                            )}

                            {activeTab === "withdraw" && (
                                <Card>
                                    <h2 className="mb-6 text-xl font-bold text-white">
                                        Withdraw Cryptocurrency
                                    </h2>

                                    {!walletInfo ? (
                                        <div className="text-center py-8">
                                            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-white mb-2">No Wallet Found</h3>
                                            <p className="text-gray-400">Create a wallet first to withdraw funds</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleWithdrawal} className="space-y-6">
                                            {errors.withdrawal && (
                                                <Alert type="error">
                                                    <AlertCircle className="w-4 h-4 inline mr-2" />
                                                    {errors.withdrawal}
                                                </Alert>
                                            )}

                                            {/* Current Balance */}
                                            <div className="bg-gray-900/50 rounded-lg p-4">
                                                <span className="text-gray-400">Available Balance</span>
                                                <div className="text-2xl font-bold text-white">
                                                    {walletBalance.toFixed(6)} ETH
                                                </div>
                                            </div>

                                            <Input
                                                label="Withdrawal Amount (ETH)"
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                max={walletBalance}
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.000000"
                                                required
                                            />

                                            <Input
                                                label="Recipient Address"
                                                type="text"
                                                value={withdrawAddress}
                                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                                placeholder="0x..."
                                                required
                                            />

                                            {/* Fee Information */}
                                            <div className="bg-gray-900/50 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-gray-300 mb-2">Transaction Details</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Amount:</span>
                                                        <span className="text-white">{withdrawAmount || '0'} ETH</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Est. Gas Fee:</span>
                                                        <span className="text-yellow-400">~0.005 ETH</span>
                                                    </div>
                                                    <div className="border-t border-gray-700 pt-1 flex justify-between font-medium">
                                                        <span className="text-gray-300">You'll Receive:</span>
                                                        <span className="text-white">{withdrawAmount || '0'} ETH</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={isProcessingWithdrawal}>
                                                {isProcessingWithdrawal ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                        Processing Withdrawal...
                                                    </>
                                                ) : (
                                                    'Withdraw Funds'
                                                )}
                                            </Button>

                                            <Alert type="warning">
                                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                                Double-check the recipient address. Transactions cannot be reversed.
                                            </Alert>
                                        </form>
                                    )}
                                </Card>
                            )}

                            {activeTab === "history" && (
                                <Card>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">
                                            Transaction History
                                        </h2>
                                        <Button onClick={() => router.reload({ only: ['historyGroup'] })} variant="secondary">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="py-3 font-medium text-left text-gray-400">Type</th>
                                                    <th className="py-3 font-medium text-left text-gray-400">Amount</th>
                                                    <th className="py-3 font-medium text-left text-gray-400">Status</th>
                                                    <th className="py-3 font-medium text-left text-gray-400">TxHash</th>
                                                    <th className="py-3 font-medium text-left text-gray-400">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyGroup?.data?.length > 0 ? (
                                                    historyGroup.data.map((tx) => (
                                                        <tr key={tx.id} className="border-b border-gray-800">
                                                            <td className="py-4">
                                                                <div className="flex items-center">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.type === "deposit" ? "bg-green-500/20" : "bg-orange-500/20"
                                                                        }`}>
                                                                        {tx.type === "deposit" ? (
                                                                            <ArrowDownRight className="w-4 h-4 text-green-400" />
                                                                        ) : (
                                                                            <ArrowUpRight className="w-4 h-4 text-orange-400" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-white capitalize">{tx.type}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 font-mono text-white">
                                                                {tx.amount} {tx.crypto || 'ETH'}
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                                        tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                                                            "bg-red-500/20 text-red-400"
                                                                    }`}>
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4">
                                                                {tx.txHash ? (
                                                                    <button
                                                                        onClick={() => copyToClipboard(tx.txHash)}
                                                                        className="flex items-center text-cyan-400 hover:text-cyan-300"
                                                                    >
                                                                        <span className="font-mono text-sm">
                                                                            {tx.txHash.slice(0, 12)}...
                                                                        </span>
                                                                        <ExternalLink className="w-3 h-3 ml-1" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-500">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 text-gray-400">
                                                                {new Date(tx.created_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-gray-400 py-8">
                                                            No transactions found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <h3 className="mb-4 text-lg font-semibold text-white">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Total Deposited</p>
                                        <p className="text-xl font-bold text-white">
                                            ${totals?.deposits?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Total Withdrawn</p>
                                        <p className="text-xl font-bold text-white">
                                            ${totals?.withdrawals?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Pending Transactions</p>
                                        <p className="text-xl font-bold text-yellow-400">
                                            {(totals?.pending_withdrawals || 0) + (totals?.pending_deposits || 0)}
                                        </p>
                                    </div>
                                    {walletInfo && (
                                        <div>
                                            <p className="text-sm text-gray-400">Wallet Balance</p>
                                            <p className="text-xl font-bold text-cyan-400">
                                                {walletBalance.toFixed(6)} ETH
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Wallet Info */}
                            {walletInfo && (
                                <Card>
                                    <h3 className="mb-4 text-lg font-semibold text-white">Wallet Info</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-400">Address</p>
                                            <div className="flex items-center space-x-2">
                                                <code className="text-xs text-cyan-400 bg-gray-900/50 px-2 py-1 rounded">
                                                    {walletInfo.address?.slice(0, 10)}...{walletInfo.address?.slice(-8)}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(walletInfo.address)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Network</p>
                                            <p className="text-sm text-white">{walletInfo.chain || 'Ethereum'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Type</p>
                                            <p className="text-sm text-white capitalize">{walletInfo.type}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CryptoAIAuthLayout>
    );
}