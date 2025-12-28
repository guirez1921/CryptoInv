import React, { useState } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  DollarSign,
  MessageSquare,
  Plus,
  Send,
  Eye,
  EyeOff,
  Check,
  X,
  Filter,
  Download,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  Mail,
  Calendar
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import CryptoAIAuthLayout from '@/Layouts/CryptoAIAuthLayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

const AdminDashboard = ({
  users = [],
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    pendingWithdrawals: 0
  }
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Manual deposit form
  const depositForm = useForm({
    user_id: '',
    amount: '',
    currency: 'USD',
    note: ''
  });

  // Message form
  const messageForm = useForm({
    user_id: '',
    subject: '',
    message: '',
    type: 'info' // info, warning, success, error
  });

  // Bulk message form
  const bulkMessageForm = useForm({
    user_ids: [],
    subject: '',
    message: '',
    type: 'info'
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    depositForm.setData('user_id', user.id);
    messageForm.setData('user_id', user.id);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    depositForm.post('/admin/users/deposit', {
      onSuccess: () => {
        setShowDepositModal(false);
        depositForm.reset();
        setSelectedUser(null);
      }
    });
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    messageForm.post('/admin/users/message', {
      onSuccess: () => {
        setShowMessageModal(false);
        messageForm.reset();
        setSelectedUser(null);
      }
    });
  };

  const handleBulkMessage = (e) => {
    e.preventDefault();
    bulkMessageForm.setData('user_ids', selectedUsers);
    bulkMessageForm.post('/admin/users/bulk-message', {
      onSuccess: () => {
        setSelectedUsers([]);
        bulkMessageForm.reset();
      }
    });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const filteredUserIds = filteredUsers.map(user => user.id);
    setSelectedUsers(
      selectedUsers.length === filteredUserIds.length
        ? []
        : filteredUserIds
    );
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active) ||
      (filterStatus === 'verified' && user.email_verified_at) ||
      (filterStatus === 'unverified' && !user.email_verified_at);

    return matchesSearch && matchesStatus;
  });

  const messageTypes = [
    { value: 'info', label: 'Information', color: 'bg-blue-500' },
    { value: 'success', label: 'Success', color: 'bg-green-500' },
    { value: 'warning', label: 'Warning', color: 'bg-yellow-500' },
    { value: 'error', label: 'Error', color: 'bg-red-500' }
  ];

  return (
    <CryptoAIAuthLayout title="Admin Dashboard - CryptoAI">
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Manage users, deposits, and communications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${stats.totalBalance?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingWithdrawals}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            {/* Header with Search and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-white">User Management</h2>
                {selectedUsers.length > 0 && (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                    {selectedUsers.length} selected
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {selectedUsers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMessageModal(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Bulk Message
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectAllUsers}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                    </th>
                    <th className="text-left py-3 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Balance</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Joined</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="py-4 px-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${user.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                            }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {user.email_verified_at && (
                            <span className="block px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-white font-semibold">
                          ${user.total_balance?.toLocaleString() || '0.00'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Available: ${user.available_balance?.toLocaleString() || '0.00'}
                        </div>
                      </td>
                      <td className="py-4 text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.get(route('admin..users.show', user.id))}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleUserSelect(user);
                              setShowDepositModal(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Deposit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleUserSelect(user);
                              setShowMessageModal(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Manual Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Manual Deposit</h3>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedUser(null);
                  depositForm.reset();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedUser && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositForm.data.amount}
                  onChange={(e) => depositForm.setData('amount', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  required
                />
                {depositForm.errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{depositForm.errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={depositForm.data.currency}
                  onChange={(e) => depositForm.setData('currency', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="USD">USD</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={depositForm.data.note}
                  onChange={(e) => depositForm.setData('note', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows="3"
                  placeholder="Add a note for this deposit..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDepositModal(false);
                    setSelectedUser(null);
                    depositForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={depositForm.processing}>
                  {depositForm.processing ? 'Processing...' : 'Add Deposit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedUsers.length > 1 ? `Message ${selectedUsers.length} Users` : 'Send Message'}
              </h3>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedUser(null);
                  messageForm.reset();
                  bulkMessageForm.reset();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedUser && selectedUsers.length <= 1 && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
            )}

            <form onSubmit={selectedUsers.length > 1 ? handleBulkMessage : handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {messageTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        if (selectedUsers.length > 1) {
                          bulkMessageForm.setData('type', type.value);
                        } else {
                          messageForm.setData('type', type.value);
                        }
                      }}
                      className={`p-2 rounded-md border text-sm font-medium transition-colors ${(selectedUsers.length > 1 ? bulkMessageForm.data.type : messageForm.data.type) === type.value
                          ? `${type.color} text-white border-transparent`
                          : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={selectedUsers.length > 1 ? bulkMessageForm.data.subject : messageForm.data.subject}
                  onChange={(e) => {
                    if (selectedUsers.length > 1) {
                      bulkMessageForm.setData('subject', e.target.value);
                    } else {
                      messageForm.setData('subject', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Message subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={selectedUsers.length > 1 ? bulkMessageForm.data.message : messageForm.data.message}
                  onChange={(e) => {
                    if (selectedUsers.length > 1) {
                      bulkMessageForm.setData('message', e.target.value);
                    } else {
                      messageForm.setData('message', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows="4"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedUser(null);
                    messageForm.reset();
                    bulkMessageForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={selectedUsers.length > 1 ? bulkMessageForm.processing : messageForm.processing}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {selectedUsers.length > 1 && bulkMessageForm.processing ? 'Sending...' :
                    !selectedUsers.length > 1 && messageForm.processing ? 'Sending...' :
                      'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CryptoAIAuthLayout>
  );
};

export default AdminDashboard;