import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Smartphone, ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';

// UI component
const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white focus:ring-cyan-500',
    outline: 'border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
  };
  const sizes = {
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${className}`} {...props}>
      {children}
    </div>
  );
};

const Input = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-200">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        <input
          className={`w-full bg-gray-700/50 border border-gray-600 rounded-lg ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

const ForgotPassword = ({ status }) => {
  const [resetMethod, setResetMethod] = useState('email');
  const { data, setData, post, processing, errors, wasSuccessful } = useForm({
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  if (wasSuccessful || status) {
    return (
      <>
        <Head title="Reset Link Sent - CryptoAI" />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Reset Link Sent</h2>
              <p className="text-gray-300 mb-6">
                We've sent a password reset link to {data.email}
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => window.location.reload()}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  try again
                </button>
              </p>
              <Link href={route('login')}>
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Forgot Password - CryptoAI" />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-white font-bold text-2xl">CryptoAI</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Reset Password</h2>
            <p className="text-gray-400 mt-2">Enter your email address to reset your password</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                placeholder="Enter your email"
                error={errors.email}
                required
              />

              <Button
                type="submit"
                loading={processing}
                className="w-full"
                size="lg"
              >
                Send Reset Email
              </Button>

              <Link
                href={route('login')}
                className="flex items-center justify-center text-sm text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
