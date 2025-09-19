export const CRYPTO_CURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', icon: '₮' },
  { symbol: 'BNB', name: 'BNB', icon: '⬟' },
];

export const INVESTMENT_TIERS = [
  {
    name: 'Starter',
    minInvestment: 100,
    expectedROI: 15,
    features: ['Basic AI Trading', 'Daily Reports', 'Email Support', 'Standard Withdrawal Speed'],
  },
  {
    name: 'Pro',
    minInvestment: 1000,
    expectedROI: 25,
    features: ['Advanced AI Trading', 'Real-time Reports', 'Priority Support', 'Fast Withdrawals', 'Portfolio Insights'],
    popular: true,
  },
  {
    name: 'VIP',
    minInvestment: 10000,
    expectedROI: 35,
    features: ['Premium AI Trading', 'Custom Strategies', '24/7 Dedicated Support', 'Instant Withdrawals', 'Advanced Analytics', 'Personal Account Manager'],
  },
];

export const FAQS = [
  {
    question: 'How does AI trading work?',
    answer: 'Our advanced AI algorithms analyze market patterns, news sentiment, and technical indicators to execute profitable trades 24/7.',
  },
  {
    question: 'Is my investment secure?',
    answer: 'Yes, we use industry-leading security measures including cold storage, multi-signature wallets, and insurance coverage.',
  },
  {
    question: 'What are the minimum and maximum investment amounts?',
    answer: 'Minimum investment starts at $100 for Starter tier, with no maximum limit for VIP tier investors.',
  },
  {
    question: 'How often can I withdraw my funds?',
    answer: 'Withdrawals are processed daily. Processing time varies by tier: Standard (24-48h), Pro (12-24h), VIP (instant).',
  },
  {
    question: 'What cryptocurrencies do you support?',
    answer: 'We support major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, and BNB for deposits and withdrawals.',
  },
];