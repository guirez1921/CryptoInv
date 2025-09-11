import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-white font-bold text-xl">CryptoAI</span>
            </div>
            <p className="text-gray-400 text-sm">
              Revolutionary AI-powered crypto trading platform for the next generation of investors.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Home</Link></li>
              <li><Link href={route('dashboard')} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Dashboard</Link></li>
              <li><Link href={route('dashboard')} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Assets</Link></li>
              <li><Link href={route('dashboard')} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Payments</Link></li>
              {/* <li><Link href={route('assets.index')} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Assets</Link></li>
              <li><Link href={route('deposits.index')} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Payments</Link></li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Risk Disclaimer</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">support@cryptoai.com</li>
              <li className="text-gray-400 text-sm">+1 (555) 123-4567</li>
              <li className="text-gray-400 text-sm">24/7 Support Available</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} CryptoAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Security
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Status
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                API
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;