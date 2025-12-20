import React from 'react';
import { Link } from '@inertiajs/react';
import { TrendingUp, Shield, Zap, Users, ChevronDown, Check, Badge, Star } from 'lucide-react';
import CryptoAILayout from '@/Layouts/CryptoAILayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

// Mock data - these would normally come from props or API
const INVESTMENT_TIERS = [
  {
    name: 'Starter',
    expectedROI: 15,
    minInvestment: 100,
    popular: false,
    features: ['Basic AI Trading', '24/7 Support', 'Monthly Reports']
  },
  {
    name: 'Professional',
    expectedROI: 25,
    minInvestment: 1000,
    popular: true,
    features: ['Advanced AI Trading', 'Priority Support', 'Weekly Reports', 'Risk Management']
  },
  {
    name: 'Elite',
    expectedROI: 35,
    minInvestment: 10000,
    popular: false,
    features: ['Premium AI Trading', 'Dedicated Manager', 'Daily Reports', 'Custom Strategies']
  }
];

const FAQS = [
  {
    question: 'How does AI trading work?',
    answer: 'Our AI analyzes real-time market data, trends, and historical patterns to make smart trading decisions on your behalf. It continuously learns and adapts to market shifts to optimize performance.',
  },
  {
    question: 'Is my investment secure?',
    answer: 'Yes, we use bank-grade encryption and multi-layered security protocols. Your funds are stored in private wallets that only you can access, and all transactions are monitored for suspicious activity.',
  },
  {
    question: 'How do I deposit funds?',
    answer: 'Each user is assigned a unique private wallet address. You can deposit crypto directly to this wallet or link your existing wallet to initiate a transfer.',
  },
  {
    question: 'Do I need trading experience?',
    answer: 'No prior experience is needed. Our AI handles all trading decisions for you, based on your selected risk profile and investment goals.',
  },
  {
    question: 'What cryptocurrencies are supported?',
    answer: 'We currently support Bitcoin (BTC), Ethereum (ETH), USDT, and several other major coins. More assets are being added regularly.',
  },
];

const testimonials = [
  {
    quote: "This AI has completely transformed my crypto portfolio. 300% returns in just 6 months!",
    author: "Sarah Chen",
    role: "Investment Banker",
    profit: "+$47,350"
  },
  {
    quote: "Finally, an AI that actually works. No more sleepless nights watching charts.",
    author: "Marcus Johnson",
    role: "Day Trader",
    profit: "+$23,890"
  },
  {
    quote: "The algorithms are incredibly sophisticated. My returns have never been better.",
    author: "Elena Rodriguez",
    role: "Portfolio Manager",
    profit: "+$89,240"
  },
  {
    quote: "Best investment I've ever made. The AI handles everything while I focus on my business.",
    author: "David Kim",
    role: "Entrepreneur",
    profit: "+$156,720"
  }
];

const recentWithdrawals = [
  { amount: "$12,450", user: "J***n", time: "2 min ago", profit: "+24.5%" },
  { amount: "$8,960", user: "S***h", time: "5 min ago", profit: "+18.9%" },
  { amount: "$25,380", user: "M***s", time: "12 min ago", profit: "+31.2%" },
  { amount: "$6,740", user: "A***a", time: "18 min ago", profit: "+15.8%" },
  { amount: "$19,200", user: "L***i", time: "25 min ago", profit: "+27.4%" },
  { amount: "$34,850", user: "R***k", time: "32 min ago", profit: "+42.1%" }
];


const Home = () => {
  return (
    <CryptoAILayout title="CryptoAI - AI-Powered Crypto Investments">
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                AI-Powered <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Crypto Investments</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Harness the power of artificial intelligence to maximize your cryptocurrency returns.
                Our advanced algorithms trade 24/7 while you sleep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={route('register')}>
                  <Button size="lg" className="text-lg px-8 py-4">
                    Start Investing
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">324%</div>
                <div className="text-gray-300">Average Annual ROI</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">99.7%</div>
                <div className="text-gray-300">Uptime Guarantee</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-gray-300">Active Investors</div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="about" className="py-24 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Simple, secure, and automated crypto investing powered by cutting-edge AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">1. Sign Up & Deposit</h3>
                <p className="text-gray-300">Create your account and deposit cryptocurrency to start your AI-powered investment journey.</p>
              </Card>

              <Card className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">2. AI Trades 24/7</h3>
                <p className="text-gray-300">Our advanced AI algorithms analyze markets and execute profitable trades around the clock.</p>
              </Card>

              <Card className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">3. Earn Monthly Profits</h3>
                <p className="text-gray-300">Watch your investments grow with consistent monthly returns and compound interest.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-gradient-to-r from-cyan-900/40 to-blue-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Investment Tiers</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose the perfect plan for your investment goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INVESTMENT_TIERS.map((tier) => (
                <Card key={tier.name} className={`text-center ${tier.popular ? 'border-cyan-500/50 relative' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-cyan-400 mb-1">{tier.expectedROI}%</div>
                  <div className="text-gray-300 mb-6">Expected Annual ROI</div>
                  <div className="text-gray-300 mb-6">
                    Min Investment: <span className="text-white font-semibold">${tier.minInvestment.toLocaleString()}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={route('register')}>
                    <Button
                      variant={tier.popular ? 'primary' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Traders Love Our <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Results</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                See what our users are saying about their AI trading experience
              </p>
            </div>

            <div className="relative">
              <div className="flex space-x-6 animate-slide-left">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <Card
                    key={index}
                    className={`rounded-lg border bg-card text-card-foreground shadow-sm flex-shrink-0 w-80 bg-gradient-card border-border/50 hover:border-success/50 transition-all duration-300 ${(index + 1) % 2 === 0 ? 'translate-y-6' : '-translate-y-6'
                      }`}
                    style={{
                      animationDelay: `${index * 0.5}s`,
                      transform: `rotate(${(index % 3 - 1) * 2}deg)`
                    }}
                  >
                    <div className="p-6 pt-0">
                      <div className="mb-4">
                        <div className="flex text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="text-sm italic text-gray-300 mb-4">
                          &quot;{testimonial.quote}&quot;
                        </blockquote>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <div>
                          <div className="font-semibold text-sm">{testimonial.author}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        </div>
                        <Badge variant="secondary" className="bg-success/20 text-success">
                          {testimonial.profit}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Withdrawals Section */}
        {/* <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-crypto bg-clip-text text-transparent">Live Withdrawals</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Real users, real profits, real withdrawals happening right now
              </p>
            </div>

            <div className="relative">
              <div className="flex space-x-6 animate-slide-left">
                {[...recentWithdrawals, ...recentWithdrawals].map((withdrawal, index) => (
                  <Card
                    key={index}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm flex-shrink-0 w-64 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300"
                    style={{
                      transform: `translateY(${(index % 3) * 20}px) rotate(${(index % 5 - 2) * 3}deg)`,
                      animationDelay: `${index * 0.3}s`
                    }}
                  >
                    <div className="pt-0 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-success">{withdrawal.amount}</div>
                        <Badge className="bg-success/20 text-success text-xs">
                          {withdrawal.profit}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User: {withdrawal.user}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {withdrawal.time}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Security */}
        <section className="py-24 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Security & Trust</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Your security is our top priority. We use industry-leading protection measures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h3>
                <p className="text-gray-300 text-sm">256-bit encryption and multi-signature wallets</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 text-cyan-400 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">🏦</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Cold Storage</h3>
                <p className="text-gray-300 text-sm">95% of funds stored offline securely</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 text-cyan-400 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">🔐</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2FA Authentication</h3>
                <p className="text-gray-300 text-sm">Two-factor authentication required</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 text-cyan-400 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">🛡️</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Insurance Coverage</h3>
                <p className="text-gray-300 text-sm">Funds protected by insurance policies</p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <Card key={index} className="group cursor-pointer" hover>
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-gray-300 mt-4 leading-relaxed">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your AI Trading Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of investors already earning with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={route('register')}>
                <Button size="lg" className="text-lg px-8 py-4">
                  Create Free Account
                </Button>
              </Link>
              <Link href={route('login')}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </CryptoAILayout>
  );
};

export default Home;