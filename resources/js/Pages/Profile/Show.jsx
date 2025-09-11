import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
  User, Mail, Phone, Shield, Smartphone, Wallet, Settings, Bell, Lock, 
  CheckCircle, AlertCircle, Clock, Eye, EyeOff, Plus, Trash2, X
} from 'lucide-react';

export default function Profile({ user, wallets, loginActivities, notifications, auth }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);

  const { data: profileData, setData: setProfileData, patch: patchProfile, processing: profileProcessing, errors: profileErrors } = useForm({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    telegram: user.telegram || '',
  });

  const { data: passwordData, setData: setPasswordData, patch: patchPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const { data: notificationData, setData: setNotificationData, patch: patchNotifications, processing: notificationProcessing } = useForm({
    daily_reports: notifications.trading.daily_reports,
    weekly_summaries: notifications.trading.weekly_summaries,
    monthly_statements: notifications.trading.monthly_statements,
    trade_execution: notifications.trading.trade_execution,
    login_new_device: notifications.security.login_new_device,
    failed_login: notifications.security.failed_login,
    password_changes: notifications.security.password_changes,
    withdrawal_requests: notifications.security.withdrawal_requests,
  });

  const { data: walletData, setData: setWalletData, post: postWallet, processing: walletProcessing, errors: walletErrors, reset: resetWallet } = useForm({
    type: '',
    address: '',
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'wallets', name: 'Wallets', icon: Wallet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    patchProfile(route('profile.update'));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    patchPassword(route('profile.password'), {
      onSuccess: () => resetPassword(),
    });
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    patchNotifications(route('profile.notifications'));
  };

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    postWallet(route('profile.wallet.connect'), {
      onSuccess: () => {
        resetWallet();
        setShowConnectWallet(false);
      },
    });
  };

  const toggleTwoFactor = () => {
    router.patch(route('profile.two-factor'));
  };

  const disconnectWallet = (walletId) => {
    router.delete(route('profile.wallet.disconnect', walletId));
  };

  const revokeSession = (sessionId) => {
    router.delete(route('profile.session.revoke', sessionId));
  };

  const getKycStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: 'bg-green-500/20 text-green-400', text: 'Verified' },
      pending: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending' },
      rejected: { color: 'bg-red-500/20 text-red-400', text: 'Rejected' },
      not_verified: { color: 'bg-gray-500/20 text-gray-400', text: 'Not Verified' }
    };
    
    const config = statusConfig[status] || statusConfig.not_verified;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${config.color}`}>
        <span>{config.text}</span>
      </div>
    );
  };

  const formatUserAgent = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Mobile')) return 'Mobile App';
    return 'Unknown Browser';
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-5 h-5 text-cyan-400" />;
    }
    return <Settings className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <Head title="Profile Settings" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          id="name"
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData('name', e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      {profileErrors.name && <div className="text-red-400 text-sm">{profileErrors.name}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData('email', e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      {profileErrors.email && <div className="text-red-400 text-sm">{profileErrors.email}</div>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData('phone', e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    {profileErrors.phone && <div className="text-red-400 text-sm">{profileErrors.phone}</div>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="telegram" className="block text-sm font-medium text-gray-200">
                      Telegram Username
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="telegram"
                        type="text"
                        value={profileData.telegram}
                        onChange={(e) => setProfileData('telegram', e.target.value)}
                        placeholder="@username"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    {profileErrors.telegram && <div className="text-red-400 text-sm">{profileErrors.telegram}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">KYC Status</label>
                      {getKycStatusBadge(user.kyc_status)}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Subscription Tier</label>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-600/20 text-cyan-400">
                        <span className="capitalize">{user.subscription_tier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileProcessing}
                      className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {profileProcessing ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-6">Password & Authentication</h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-200">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          id="current_password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData('current_password', e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.current_password && <div className="text-red-400 text-sm">{passwordErrors.current_password}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.password}
                          onChange={(e) => setPasswordData('password', e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.password && <div className="text-red-400 text-sm">{passwordErrors.password}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-200">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          id="password_confirmation"
                          type="password"
                          value={passwordData.password_confirmation}
                          onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordProcessing}
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        {passwordProcessing ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-700">
                                        <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                        <p className="text-gray-400 text-sm">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        onClick={toggleTwoFactor}
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        {user.two_factor_enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    {loginActivities.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(session.user_agent)}
                          <div>
                            <p className="text-white font-medium">
                              {formatUserAgent(session.user_agent)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {session.ip_address} • {session.last_active}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => revokeSession(session.id)}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" /> Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallets' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Connected Wallets</h2>

                {/* Wallet list */}
                <div className="space-y-4 mb-6">
                  {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{wallet.type}</p>
                          <p className="text-gray-400 text-sm">{wallet.address}</p>
                        </div>
                        <button
                          onClick={() => disconnectWallet(wallet.id)}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Disconnect
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No wallets connected yet.</p>
                  )}
                </div>

                {/* Add Wallet */}
                {showConnectWallet ? (
                  <form onSubmit={handleWalletSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-200 mb-2">Wallet Type</label>
                      <input
                        type="text"
                        value={walletData.type}
                        onChange={(e) => setWalletData('type', e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g., Metamask"
                      />
                      {walletErrors.type && (
                        <div className="text-red-400 text-sm">{walletErrors.type}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-200 mb-2">Wallet Address</label>
                      <input
                        type="text"
                        value={walletData.address}
                        onChange={(e) => setWalletData('address', e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="0x..."
                      />
                      {walletErrors.address && (
                        <div className="text-red-400 text-sm">{walletErrors.address}</div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={walletProcessing}
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
                      >
                        {walletProcessing ? 'Connecting...' : 'Connect Wallet'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConnectWallet(false)}
                        className="bg-gray-700 text-gray-300 hover:text-white px-6 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowConnectWallet(true)}
                    className="flex items-center bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Connect Wallet
                  </button>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                <form onSubmit={handleNotificationSubmit} className="space-y-4">
                  {Object.entries(notificationData).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-200 capitalize">{key.replace('_', ' ')}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotificationData(key, e.target.checked)
                        }
                        className="w-5 h-5 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                      />
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={notificationProcessing}
                      className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
                    >
                      {notificationProcessing ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
