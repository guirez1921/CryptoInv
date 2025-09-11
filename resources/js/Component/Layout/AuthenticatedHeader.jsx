import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, User, LogOut, Settings, Menu, Wallet } from 'lucide-react';
import { route } from 'ziggy-js';

const AuthenticatedHeader = ({ user = null, userBalance = null, notificationCount = 0, sidebarOpen, setSidebarOpen }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Format balance for display
  const formattedBalance = userBalance ? userBalance.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }) : '$0.00';

  // Display simplified balance for mobile based on amount
  const getSimplifiedBalance = (balance) => {
    if (!balance) return '$0.00';
    if (balance >= 1000000) return `$${(balance / 1000000).toFixed(1)}M`;
    if (balance >= 1000) return `$${(balance / 1000).toFixed(1)}K`;
    return balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  const simplifiedBalance = getSimplifiedBalance(userBalance);

  const handleLogout = () => {
    router.post(route('logout'));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500">
              <span className="text-lg font-bold text-white">AI</span>
            </div>
            <span className="text-xl font-bold text-white">CryptoAI</span>
          </Link>

          {/* Right side - Balance, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Balance */}
            <Link
              href={route('assets.index')}
              className="group items-center hidden px-4 py-2 space-x-2 transition-all duration-200 rounded-lg sm:flex bg-gray-800/50 hover:bg-gray-800/70 hover:scale-105"
              title={userBalance !== null ? `Click to view portfolio details\nTotal Balance: ${formattedBalance}` : 'Loading balance...'}
            >
              <Wallet className="w-5 h-5 text-cyan-400 flex-shrink-0 group-hover:text-cyan-300 transition-colors" />
              <div className="text-right">
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Total Balance</p>
                <p className={`text-sm font-semibold transition-colors ${
                  userBalance === null ? 'text-gray-400' : 
                  userBalance > 0 ? 'text-white group-hover:text-cyan-100' : 'text-gray-300'
                }`}>
                  {userBalance === null ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : formattedBalance}
                </p>
              </div>
            </Link>

            {/* Mobile Balance */}
            <Link
              href={route('assets.index')}
              className="flex items-center px-3 py-2 transition-colors rounded-lg sm:hidden bg-gray-800/50 hover:bg-gray-800/70"
            >
              <span className={`text-sm font-semibold ${
                userBalance === null ? 'text-gray-400' : 
                userBalance > 0 ? 'text-white' : 'text-gray-300'
              }`}>
                {userBalance === null ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  userBalance && userBalance > 1000 ? simplifiedBalance : formattedBalance
                )}
              </span>
            </Link>

            {/* Notifications */}
            <Link
              href={route('notifications.index')}
              className="relative p-2 text-gray-300 transition-colors rounded-lg hover:text-cyan-400 hover:bg-gray-800/50"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center p-2 space-x-2 text-gray-300 transition-colors rounded-lg hover:text-cyan-400 hover:bg-gray-800/50"
              >
                <User className="w-5 h-5" />
                <span className="hidden text-sm md:block">
                  {user?.name || 'User'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                  <Link
                    href={route('profile.edit')}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                  <hr className="my-1 border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="p-2 mr-2 text-gray-300 rounded-md lg:hidden hover:text-cyan-400 hover:bg-gray-800/50 focus:outline-none"
              onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedHeader;
