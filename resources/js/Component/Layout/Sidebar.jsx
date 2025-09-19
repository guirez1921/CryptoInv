import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  Bell, 
  User, 
  ChevronRight 
} from 'lucide-react';
import { route } from 'ziggy-js';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { url } = usePage();

  const navigation = [
    {
      name: 'Dashboard',
      href: route('dashboard'),
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      name: 'Assets',
      href: route('assets.index'),
      icon: TrendingUp,
      description: 'Portfolio Management'
    },
    {
      name: 'Payments',
      href: route('payments.index'),
      icon: CreditCard,
      description: 'Deposits & Withdrawals'
    },
    {
      name: 'Notifications',
      href: route('notifications.index'),
      icon: Bell,
      description: 'Alerts & Updates'
    },
    {
      name: 'Profile',
      href: route('profile.show'),
      icon: User,
      description: 'Account Settings'
    }
  ];

  const isActive = (href) => {
    return url === href || url.startsWith(href);
  };

  return (
    <div
      className={`sticky left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-40 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'} lg:static lg:block`}
      style={{ zIndex: 40 }}
    >
      <div className="p-6">
        {/* Navigation Title */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Navigation
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-xs ${active ? 'text-cyan-100' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1'
                }`} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="pt-6 mt-8 border-t border-gray-800">
          <div className="px-4 py-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <span className="text-sm font-bold text-white">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">AI Trading</p>
                <p className="text-xs text-green-400">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
