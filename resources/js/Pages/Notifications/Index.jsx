import React, { useState } from 'react';
import { Bell, TrendingUp, DollarSign, Shield, Megaphone, X, Check, CheckCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

const NOTIFICATION_CATEGORIES = [
  { id: 'all', name: 'All', icon: Bell },
  { id: 'profit', name: 'Profits', icon: TrendingUp },
  { id: 'deposit', name: 'Deposits', icon: DollarSign },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'announcement', name: 'Updates', icon: Megaphone }
];

const CATEGORY_COLORS = {
  profit: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    accent: 'bg-green-500'
  },
  deposit: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    accent: 'bg-blue-500'
  },
  security: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    accent: 'bg-red-500'
  },
  announcement: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    accent: 'bg-purple-500'
  },
  default: {
    bg: 'bg-gray-700/30',
    border: 'border-gray-600/30',
    icon: 'text-gray-400',
    accent: 'bg-gray-500'
  }
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const category = notification.data?.category || 'default';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const CategoryIcon = NOTIFICATION_CATEGORIES.find(cat => cat.id === category)?.icon || Bell;

  return (
    <Card className={`${colors.bg} ${colors.border} border transition-all duration-300 hover:border-opacity-50`}>
      <div className="flex items-start space-x-4">
        {/* Category Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.accent}/20 flex items-center justify-center mt-1`}>
          <CategoryIcon className={`w-5 h-5 ${colors.icon}`} />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-white font-semibold text-sm">
                  {notification.data?.title || 'Notification'}
                </h3>
                {!notification.read_at && (
                  <div className={`w-2 h-2 rounded-full ${colors.accent}`}></div>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {notification.data?.body || notification.data?.message || 'No content available'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()} at{' '}
                  {new Date(notification.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.icon} border ${colors.border}`}>
                  {NOTIFICATION_CATEGORIES.find(cat => cat.id === category)?.name || 'General'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-gray-400 hover:text-white"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="text-gray-400 hover:text-red-400"
                title="Delete notification"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const NotificationsIndex = ({ notifications, auth }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Filter notifications based on active category
  const filteredNotifications = notifications.data.filter(notification => {
    if (activeCategory === 'all') return true;
    return notification.data?.category === activeCategory;
  });

  const handleMarkAsRead = async (notificationId) => {
    setLoading(true);
    try {
      await router.patch(route('notifications.read', notificationId), {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Notification will be updated via Inertia
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (notificationId) => {
    setLoading(true);
    try {
      await router.delete(route('notifications.destroy', notificationId), {
        preserveScroll: true,
        onSuccess: () => {
          // Notification will be removed via Inertia
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    setLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await router.patch(route('notifications.read-all'), {}, {
        preserveScroll: true,
        onSuccess: () => {
          // All notifications will be updated via Inertia
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
    setLoading(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await router.delete(route('notifications.destroy-all'), {
        preserveScroll: true,
        onSuccess: () => {
          // All notifications will be removed via Inertia
        }
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
    setLoading(false);
  };

  const unreadCount = notifications.data.filter(n => !n.read_at).length;
  const categoryCount = (categoryId) => {
    if (categoryId === 'all') return notifications.data.length;
    return notifications.data.filter(n => n.data?.category === categoryId).length;
  };

  return (
    <CryptoAIAuthLayout title="Notifications - CryptoAI">
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-gray-400">
                Stay updated with your trading activities and account changes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-sm"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={handleDeleteAll}
                disabled={loading}
                className="text-sm text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  {NOTIFICATION_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    const count = categoryCount(category.id);
                    const isActive = activeCategory === category.id;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30' 
                            : 'hover:bg-gray-700/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {category.name}
                          </span>
                        </div>
                        {count > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isActive 
                              ? 'bg-cyan-500/20 text-cyan-400' 
                              : 'bg-gray-600/50 text-gray-400'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Stats Card */}
              <Card className="mt-6">
                <h4 className="text-md font-semibold text-white mb-4">Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-white font-medium">{notifications.data.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Unread</span>
                    <span className="text-cyan-400 font-medium">{unreadCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Read</span>
                    <span className="text-green-400 font-medium">{notifications.data.length - unreadCount}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="lg:col-span-3">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No notifications found</h3>
                  <p className="text-gray-400">
                    {activeCategory === 'all' 
                      ? "You don't have any notifications yet." 
                      : `No notifications in the ${NOTIFICATION_CATEGORIES.find(c => c.id === activeCategory)?.name} category.`
                    }
                  </p>
                </Card>
              )}

              {/* Pagination */}
              {notifications.links && notifications.links.length > 3 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    {notifications.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        className={`px-3 py-2 rounded-md text-sm ${
                          link.active
                            ? 'bg-cyan-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CryptoAIAuthLayout>
  );
};

export default NotificationsIndex;