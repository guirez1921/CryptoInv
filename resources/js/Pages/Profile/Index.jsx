import React, { useState } from 'react';
import { User, Shield, Smartphone, Settings, Wallet, Eye, EyeOff, Trash2, Plus, CheckCircle, AlertTriangle, Monitor, Globe } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

const Profile = ({
    user,
    wallets = [],
    loginActivities = [],
    notifications = {
        trading: {},
        security: {}
    }
}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [showWalletForm, setShowWalletForm] = useState(false);

    // Profile form
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Notification settings form
    const notificationForm = useForm({
        daily_reports: notifications.trading.daily_reports || false,
        weekly_summaries: notifications.trading.weekly_summaries || false,
        monthly_statements: notifications.trading.monthly_statements || false,
        trade_execution: notifications.trading.trade_execution || false,
        login_new_device: notifications.security.login_new_device || true,
        failed_login: notifications.security.failed_login || true,
        password_changes: notifications.security.password_changes || true,
        withdrawal_requests: notifications.security.withdrawal_requests || true,
    });

    // Wallet form
    const walletForm = useForm({
        type: 'bitcoin',
        address: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put('/profile/update', {
            onSuccess: () => {
                // Handle success
            }
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            onSuccess: () => {
                passwordForm.reset();
            }
        });
    };

    const handleNotificationSubmit = (e) => {
        e.preventDefault();
        notificationForm.put('/profile/notifications');
    };

    const handleWalletSubmit = (e) => {
        e.preventDefault();
        walletForm.post('/profile/wallet/connect', {
            onSuccess: () => {
                walletForm.reset();
                setShowWalletForm(false);
            }
        });
    };

    const handleWalletDisconnect = (walletId) => {
        if (confirm('Are you sure you want to disconnect this wallet?')) {
            // Use router.delete or similar method
            window.location.href = `/profile/wallet/${walletId}/disconnect`;
        }
    };

    const handleSessionRevoke = (sessionId) => {
        if (confirm('Are you sure you want to revoke this session?')) {
            window.location.href = `/profile/session/${sessionId}/revoke`;
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'devices', label: 'Devices', icon: Smartphone },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'wallets', label: 'My Wallets', icon: Wallet },
    ];

    const walletTypes = [
        { value: 'bitcoin', label: 'Bitcoin', icon: '₿' },
        { value: 'ethereum', label: 'Ethereum', icon: 'Ξ' },
        { value: 'binance', label: 'Binance Smart Chain', icon: 'BNB' },
        { value: 'metamask', label: 'MetaMask', icon: '🦊' },
    ];

    return (
        <CryptoAIAuthLayout title="Profile - CryptoAI">
            <div className="py-8">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-white">Profile Settings</h1>
                        <p className="text-gray-400">Manage your account settings and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="p-0 overflow-hidden">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                                        ? 'bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-500'
                                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5 mr-3" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <Card>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                                        <p className="text-gray-400">Update your account's profile information and email address.</p>
                                    </div>

                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.data.name}
                                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    required
                                                />
                                                {profileForm.errors.name && (
                                                    <p className="text-red-400 text-sm mt-1">{profileForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    required
                                                />
                                                {profileForm.errors.email && (
                                                    <p className="text-red-400 text-sm mt-1">{profileForm.errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profileForm.data.phone}
                                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    placeholder="Optional"
                                                />
                                                {profileForm.errors.phone && (
                                                    <p className="text-red-400 text-sm mt-1">{profileForm.errors.phone}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Account Status
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    {user.email_verified_at ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                                    )}
                                                    <span className={`text-sm ${user.email_verified_at ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {user.email_verified_at ? 'Verified' : 'Not Verified'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={profileForm.processing}>
                                                {profileForm.processing ? 'Updating...' : 'Update Profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <Card>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
                                            <p className="text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
                                        </div>

                                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        value={passwordForm.data.current_password}
                                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showPassword.current ? (
                                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.current_password && (
                                                    <p className="text-red-400 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        value={passwordForm.data.password}
                                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showPassword.new ? (
                                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.password && (
                                                    <p className="text-red-400 text-sm mt-1">{passwordForm.errors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        value={passwordForm.data.password_confirmation}
                                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showPassword.confirm ? (
                                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.password_confirmation && (
                                                    <p className="text-red-400 text-sm mt-1">{passwordForm.errors.password_confirmation}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={passwordForm.processing}>
                                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>

                                    <Card>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                                            <p className="text-gray-400">Add additional security to your account using two-factor authentication.</p>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                            <div>
                                                <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                                                <p className="text-gray-400 text-sm">
                                                    {user.two_factor_enabled ? 'Currently enabled' : 'Currently disabled'}
                                                </p>
                                            </div>
                                            <Button
                                                variant={user.two_factor_enabled ? 'destructive' : 'primary'}
                                                onClick={() => {
                                                    // Handle 2FA toggle
                                                    window.location.href = '/profile/2fa/toggle';
                                                }}
                                            >
                                                {user.two_factor_enabled ? 'Disable' : 'Enable'}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Devices Tab */}
                            {activeTab === 'devices' && (
                                <Card>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Login Activities</h2>
                                        <p className="text-gray-400">Manage and monitor your account access across different devices.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {loginActivities.length > 0 ? (
                                            loginActivities.map((activity) => (
                                                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                                            {activity.user_agent?.includes('Mobile') ? (
                                                                <Smartphone className="w-5 h-5 text-white" />
                                                            ) : (
                                                                <Monitor className="w-5 h-5 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h3 className="text-white font-medium">
                                                                    {activity.user_agent?.includes('Mobile') ? 'Mobile Device' : 'Desktop'}
                                                                </h3>
                                                                {activity.is_current && (
                                                                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                                                                        Current Session
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-gray-400 text-sm space-y-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <Globe className="w-3 h-3" />
                                                                    <span>{activity.ip_address}</span>
                                                                </div>
                                                                {activity.location && (
                                                                    <div>{activity.location}</div>
                                                                )}
                                                                <div>Last active: {new Date(activity.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!activity.is_current && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleSessionRevoke(activity.id)}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                                <p className="text-gray-400">No login activities found</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <Card>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
                                        <p className="text-gray-400">Configure how you want to receive notifications about your account.</p>
                                    </div>

                                    <form onSubmit={handleNotificationSubmit} className="space-y-8">
                                        {/* Trading Notifications */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">Trading Notifications</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Daily Reports</label>
                                                        <p className="text-gray-400 text-sm">Receive daily trading performance reports</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.daily_reports}
                                                            onChange={(e) => notificationForm.setData('daily_reports', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Weekly Summaries</label>
                                                        <p className="text-gray-400 text-sm">Receive weekly performance summaries</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.weekly_summaries}
                                                            onChange={(e) => notificationForm.setData('weekly_summaries', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Monthly Statements</label>
                                                        <p className="text-gray-400 text-sm">Receive monthly account statements</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.monthly_statements}
                                                            onChange={(e) => notificationForm.setData('monthly_statements', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Trade Execution</label>
                                                        <p className="text-gray-400 text-sm">Get notified when trades are executed</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.trade_execution}
                                                            onChange={(e) => notificationForm.setData('trade_execution', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Notifications */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">Security Notifications</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">New Device Login</label>
                                                        <p className="text-gray-400 text-sm">Alert when your account is accessed from a new device</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.login_new_device}
                                                            onChange={(e) => notificationForm.setData('login_new_device', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Failed Login Attempts</label>
                                                        <p className="text-gray-400 text-sm">Alert on multiple failed login attempts</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.failed_login}
                                                            onChange={(e) => notificationForm.setData('failed_login', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Password Changes</label>
                                                        <p className="text-gray-400 text-sm">Alert when your password is changed</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.password_changes}
                                                            onChange={(e) => notificationForm.setData('password_changes', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-white font-medium">Withdrawal Requests</label>
                                                        <p className="text-gray-400 text-sm">Alert on withdrawal requests and confirmations</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationForm.data.withdrawal_requests}
                                                            onChange={(e) => notificationForm.setData('withdrawal_requests', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={notificationForm.processing}>
                                                {notificationForm.processing ? 'Saving...' : 'Save Settings'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            )}

                            {/* Wallets Tab */}
                            {activeTab === 'wallets' && (
                                <div className="space-y-6">
                                    <Card>
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">My Wallets</h2>
                                                <p className="text-gray-400">Manage your connected cryptocurrency wallets</p>
                                            </div>
                                            <Button onClick={() => setShowWalletForm(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Wallet
                                            </Button>
                                        </div>

                                        {/* Default Platform Wallet */}
                                        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <Wallet className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-semibold">CryptoAI Platform Wallet</h3>
                                                        <p className="text-cyan-400 text-sm">Default Platform Wallet</p>
                                                        <p className="text-gray-400 text-xs">Address: 1A2b...Xy9z (Auto-generated)</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-green-400 font-semibold">Active</p>
                                                    <p className="text-gray-400 text-sm">Primary Wallet</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Wallet Form */}
                                        {showWalletForm && (
                                            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-white font-semibold">Connect New Wallet</h3>
                                                    <button
                                                        onClick={() => setShowWalletForm(false)}
                                                        className="text-gray-400 hover:text-white"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <form onSubmit={handleWalletSubmit} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Wallet Type
                                                        </label>
                                                        <select
                                                            value={walletForm.data.type}
                                                            onChange={(e) => walletForm.setData('type', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                        >
                                                            {walletTypes.map((type) => (
                                                                <option key={type.value} value={type.value}>
                                                                    {type.icon} {type.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Wallet Address / Private Key
                                                        </label>
                                                        <textarea
                                                            value={walletForm.data.address}
                                                            onChange={(e) => walletForm.setData('address', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                            rows="3"
                                                            placeholder="Enter your wallet address or seed phrase..."
                                                            required
                                                        />
                                                        {walletForm.errors.address && (
                                                            <p className="text-red-400 text-sm mt-1">{walletForm.errors.address}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end space-x-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setShowWalletForm(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={walletForm.processing}>
                                                            {walletForm.processing ? 'Connecting...' : 'Connect Wallet'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Connected Wallets */}
                                        <div className="space-y-4">
                                            {wallets.length > 0 ? (
                                                wallets.map((wallet) => (
                                                    <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                                                <span className="text-white font-bold">
                                                                    {walletTypes.find(t => t.value === wallet.type)?.icon || '₿'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-white font-medium capitalize">
                                                                    {walletTypes.find(t => t.value === wallet.chain)?.label || wallet.chain} Wallet
                                                                </h3>
                                                                <p className="text-gray-400 text-sm">
                                                                    Address: {wallet.addresses[0]?.address ? `${wallet.addresses[0].address.substring(0, 10)}...${wallet.addresses[0].address.substring(wallet.addresses[0].address.length - 6)}` : 'N/A'}
                                                                </p>

                                                                <p className="text-gray-400 text-xs">
                                                                    Balance: ${wallet.addresses[0]?.balance?.toLocaleString() || '0.00'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${wallet.is_active
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                {wallet.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleWalletDisconnect(wallet.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                                    <p className="text-gray-400">No additional wallets connected</p>
                                                    <p className="text-gray-500 text-sm">Connect your external wallets to manage all your crypto assets</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Wallet Security Notice */}
                                    <Card className="bg-yellow-500/10 border-yellow-500/30">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
                                            <div>
                                                <h3 className="text-yellow-400 font-semibold mb-2">Security Notice</h3>
                                                <ul className="text-gray-300 text-sm space-y-1">
                                                    <li>• Never share your private keys or seed phrases with anyone</li>
                                                    <li>• Always verify wallet addresses before sending transactions</li>
                                                    <li>• Use hardware wallets for large amounts</li>
                                                    <li>• Keep your wallet software updated</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CryptoAIAuthLayout>
    );
};

export default Profile;