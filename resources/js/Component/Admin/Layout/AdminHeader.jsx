import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, User, LogOut, Settings, Menu, Shield } from 'lucide-react';
import { route } from 'ziggy-js';

const AdminHeader = ({ user = null, notificationCount = 0, sidebarOpen, setSidebarOpen }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={route('admin.dashboard')} className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-orange-500">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">CryptoAI <span className="text-red-500">Admin</span></span>
                    </Link>

                    {/* Right side - Notifications, User Menu */}
                    <div className="flex items-center space-x-4">

                        {/* Notifications */}
                        {/* 
            <Link
              href={route('notifications.index')}
              className="relative p-2 text-gray-300 transition-colors rounded-lg hover:text-red-400 hover:bg-gray-800/50"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link> 
            */}

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center p-2 space-x-2 text-gray-300 transition-colors rounded-lg hover:text-red-400 hover:bg-gray-800/50"
                            >
                                <div className="flex items-center justify-center w-8 h-8 bg-red-900/50 rounded-full">
                                    <User className="w-5 h-5 text-red-200" />
                                </div>
                                <span className="hidden text-sm md:block text-red-100">
                                    {user?.name || 'Administrator'}
                                </span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                        Admin Account
                                    </div>
                                    {/* 
                  <Link
                    href={route('profile.edit')}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link> 
                  */}
                                    <hr className="my-1 border-gray-700" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 transition-colors hover:bg-gray-700 hover:text-red-300"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="p-2 mr-2 text-gray-300 rounded-md lg:hidden hover:text-red-400 hover:bg-gray-800/50 focus:outline-none"
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

export default AdminHeader;
