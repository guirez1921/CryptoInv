import React from 'react';
import { Link } from '@inertiajs/react';
import { Users, Zap, Shield, TrendingUp, Brain, Globe, Clock, Award } from 'lucide-react';
import CryptoAILayout from '@/Layouts/CryptoAILayout';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

const About = () => {
  return (
    <CryptoAILayout title="About Us - CryptoAI">
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-cyan-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                About <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CryptoAI</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Revolutionizing cryptocurrency investment through the power of artificial intelligence.
                We believe in making smart, automated trading accessible to everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={route('register')}>
                  <Button size="lg" className="text-lg px-8 py-4">
                    Join Us Today
                  </Button>
                </Link>
                <Link href={route('home')}>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Story</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Founded by a team of seasoned traders and AI researchers, CryptoAI was born from a simple idea:
                democratize access to sophisticated trading strategies previously available only to institutional investors.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">From Vision to Reality</h3>
                <p className="text-gray-300 mb-4">
                  In 2022, recognizing the growing complexity of cryptocurrency markets and the challenges faced by
                  individual investors, our founders set out to create a platform that harnesses the power of
                  artificial intelligence to navigate these dynamic landscapes.
                </p>
                <p className="text-gray-300 mb-4">
                  Our mission is clear: to empower individuals to achieve their financial goals through
                  cutting-edge, automated trading technology, regardless of their trading experience.
                </p>
                <p className="text-gray-300">
                  Today, thousands of investors trust our platform to manage their portfolios, benefiting from
                  our AI's ability to analyze vast amounts of market data and execute trades 24/7.
                </p>
              </div>
              <div>
                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/20">
                  <div className="p-8">
                    <Brain className="w-16 h-16 text-cyan-400 mb-6 mx-auto" />
                    <h4 className="text-xl font-semibold text-white mb-2">AI-Driven Excellence</h4>
                    <p className="text-gray-300">
                      Our proprietary AI algorithms continuously learn and adapt to market conditions,
                      identifying opportunities and managing risk with precision.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose CryptoAI?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                We combine the latest in artificial intelligence with a commitment to security and transparency.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-8 hover:border-cyan-500/50 transition-all duration-300">
                <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">24/7 AI Trading</h3>
                <p className="text-gray-300 text-sm">
                  Our AI never sleeps. It monitors markets and executes trades around the clock, capitalizing on opportunities as they arise.
                </p>
              </Card>
              <Card className="text-center p-8 hover:border-cyan-500/50 transition-all duration-300">
                <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">Top-Tier Security</h3>
                <p className="text-gray-300 text-sm">
                  Your funds are protected with bank-grade encryption, cold storage, and multi-signature wallets.
                </p>
              </Card>
              <Card className="text-center p-8 hover:border-cyan-500/50 transition-all duration-300">
                <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">Proven Performance</h3>
                <p className="text-gray-300 text-sm">
                  Our algorithms are designed for consistent, long-term growth, leveraging advanced market analysis.
                </p>
              </Card>
              <Card className="text-center p-8 hover:border-cyan-500/50 transition-all duration-300">
                <Users className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">Trusted Community</h3>
                <p className="text-gray-300 text-sm">
                  Join over 50,000 investors who have chosen us to manage their crypto investments.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Technology */}
        <section className="py-24 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Technology</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                At the core of our platform lies a sophisticated AI engine designed for the unique challenges of cryptocurrency markets.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/20 h-full">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">How Our AI Works</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="bg-cyan-500/20 p-2 rounded-full mr-4">
                          <Globe className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Real-Time Analysis</h4>
                          <p className="text-gray-300 text-sm">
                            Our AI processes real-time market data, news, and social sentiment to make informed decisions.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-cyan-500/20 p-2 rounded-full mr-4">
                          <Clock className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Continuous Learning</h4>
                          <p className="text-gray-300 text-sm">
                            The system continuously learns from market patterns and refines its strategies for better performance.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-cyan-500/20 p-2 rounded-full mr-4">
                          <Shield className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Risk Management</h4>
                          <p className="text-gray-300 text-sm">
                            Built-in risk controls help protect your capital during volatile market conditions.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Designed for Everyone</h3>
                <p className="text-gray-300 mb-4">
                  You don't need to be a trading expert. Our platform is designed for users of all experience levels.
                  Simply deposit your cryptocurrency, select your preferred investment tier, and let our AI do the work.
                </p>
                <p className="text-gray-300 mb-6">
                  Whether you're a beginner looking to dip your toes into crypto investment or an experienced trader
                  seeking to diversify your strategy, our platform provides the tools and automation you need.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-gray-800"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 border-2 border-gray-800"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-gray-800"></div>
                  </div>
                  <span className="text-gray-300">Join thousands of satisfied investors today.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Award className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Commitment to You</h2>
            <p className="text-xl text-gray-300 mb-8">
              We are committed to providing a transparent, secure, and profitable investment experience.
            </p>
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-8">
              <p className="text-gray-300 italic mb-6">
                "Our goal is to simplify cryptocurrency investing by leveraging artificial intelligence.
                We strive to deliver consistent returns while maintaining the highest standards of security and user trust."
              </p>
              <p className="text-cyan-400 font-semibold">- The CryptoAI Team</p>
            </Card>
            <div className="mt-12">
              <Link href={route('register')}>
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Your AI Trading Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </CryptoAILayout>
  );
};

export default About;