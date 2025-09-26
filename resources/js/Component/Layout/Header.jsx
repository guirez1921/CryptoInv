import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { route } from 'ziggy-js';

const Header = ({ isAuthenticated = false, user = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { url } = usePage();

  // const navigation = isAuthenticated 
  //   ? [
  //       { name: 'Dashboard', href: route('dashboard') },
  //       { name: 'Assets', href: route('dashboard') },
  //       { name: 'Payments', href: route('dashboard') },
  //       { name: 'Notifications', href: route('dashboard') },
  //       // { name: 'Assets', href: route('assets.index') },
  //       // { name: 'Payments', href: route('deposits.index') },
  //       // { name: 'Notifications', href: route('notifications.index') },
  //     ]
  //   : [
  //       { name: 'Home', href: '/' },
  //       { name: 'About', href: '#about' },
  //       { name: 'Pricing', href: '#pricing' },
  //       { name: 'FAQ', href: '#faq' },
  //     ];

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const isActive = (href) => {
    if (href.startsWith('#')) return false;
    return url === href || url.startsWith(href);
  };

  const handleLogout = () => {
    router.post(route('logout'));
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-white font-bold text-xl">CryptoAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${isActive(item.href)
                      ? 'text-cyan-400'
                      : 'text-gray-300 hover:text-cyan-400'
                    }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href={route('notifications.index')} className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                      <Link
                        href={route('profile.edit')}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href={route('login')}
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={route('register')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-cyan-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:text-cyan-400 hover:bg-gray-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${isActive(item.href)
                      ? 'text-cyan-400 bg-gray-700'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}

            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <Link
                  href={route('login')}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-cyan-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href={route('register')}
                  className="block px-3 py-2 mt-2 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;