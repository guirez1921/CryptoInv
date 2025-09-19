import { User, Transaction, Asset, Notification } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  kycStatus: 'verified',
  subscriptionTier: 'pro',
  totalBalance: 15420.50,
  investedAmount: 12000.00,
  totalProfit: 3420.50,
  availableFunds: 2420.50,
  wallets: [
    { id: '1', type: 'binance', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', isActive: true },
    { id: '2', type: 'metamask', address: '0x742d35Cc6634C0532925a3b8D95Db11d4c439cD', isActive: true },
  ],
  twoFactorEnabled: true,
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'profit',
    amount: 245.50,
    crypto: 'USDT',
    status: 'confirmed',
    date: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'deposit',
    amount: 1000.00,
    crypto: 'BTC',
    status: 'confirmed',
    txHash: '0x742d35Cc6634C0532925a3b8D95Db11d4c439cD',
    date: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 500.00,
    crypto: 'ETH',
    status: 'pending',
    date: '2024-01-13T09:15:00Z',
    fee: 5.00,
  },
];

export const mockAssets: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 42350.00, change24h: 2.5, allocation: 40, strategy: 'balanced' },
  { symbol: 'ETH', name: 'Ethereum', price: 2650.00, change24h: -1.2, allocation: 30, strategy: 'aggressive' },
  { symbol: 'BNB', name: 'BNB', price: 315.50, change24h: 3.8, allocation: 20, strategy: 'conservative' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.1, allocation: 10, strategy: 'conservative' },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'profit',
    title: 'Profit Credited',
    message: 'Your daily AI trading profit of $245.50 has been credited to your account.',
    date: '2024-01-15T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'deposit',
    title: 'Deposit Confirmed',
    message: 'Your Bitcoin deposit of 0.023 BTC has been confirmed on the blockchain.',
    date: '2024-01-14T14:20:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'security',
    title: 'New Device Login',
    message: 'New login detected from Chrome on Windows. If this wasn\'t you, please secure your account.',
    date: '2024-01-13T18:45:00Z',
    read: true,
  },
];