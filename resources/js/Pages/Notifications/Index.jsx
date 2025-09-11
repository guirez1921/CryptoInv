import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, TrendingUp, Shield, DollarSign, Megaphone } from 'lucide-react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/CryptoAI/UI/Button';
import Card from '@/component/CryptoAI/UI/Card';

// Mock data
const mockNotifications = [
  {
    id: '1',
    type: 'profit',
    title: 'Daily Profit Credited',
    message: 'Your account has been credited with $245.50 in daily profits.',
    date: '2024-01-15T10:30:00Z',
    read: false
  },
  {
    id: '2',
    type: 'deposit',
    title: 'Deposit Confirmed',
    message: 'Your deposit of $1,000 has been confirmed and added to your account.',
    date: '2024-01-14T15:20:00Z',
    read: true
  },
  {
    id: '3',
    type: 'security',
    title: 'Security Alert',
    message: 'New device login detected. Please verify if this was you.',
    date: '2024-01-13T09:15:00Z',
    read: false
  }
];


const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const notificationIcons = {
    profit: TrendingUp,
    deposit: DollarSign,
    withdrawal: DollarSign,
    security: Shield,
    announcement: Megaphone,
  };

  const notificationColors = {
    profit: 'text-green-400',
    deposit: 'text-blue-400',
    withdrawal: 'text-orange-400',
    security: 'text-red-400',
    announcement: 'text-purple-400',
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <CryptoAIAuthLayout title="Notifications - CryptoAI">
      <div className="py-8">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 mb-8 md md:flex-row md:gap-0">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400">
                Stay updated with your trading activity and account security
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <Card className="mb-8">
            <div className="flex gap-1 overflow-x-auto overflow-y-hidden md:gap-2 whitespace-nowrap scrollbar-hide">
              {[
                { id: 'all', name: 'All', icon: Bell },
                { id: 'profit', name: 'Profits', icon: TrendingUp },
                { id: 'deposit', name: 'Deposits', icon: DollarSign },
                { id: 'security', name: 'Security', icon: Shield },
                { id: 'announcement', name: 'Updates', icon: Megaphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = tab.id === 'all'
                  ? notifications.length
                  : notifications.filter(n => n.type === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                    <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-white">No notifications</h3>
                <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const color = notificationColors[notification.type];

                return (
                  <Card
                    key={notification.id}
                    className={`transition-all hover:border-cyan-500/30 ${!notification.read ? 'border-l-4 border-l-cyan-500 bg-cyan-500/5' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-700' : 'bg-cyan-600'
                          }`}>
                          <Icon className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-white'}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center mb-1 space-x-2">
                            <h3 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            )}
                          </div>

                          <p className="mb-2 text-sm text-gray-400">
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 transition-colors hover:text-cyan-400"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 transition-colors hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Load More */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline">Load More Notifications</Button>
            </div>
          )}
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
}
export default Notifications