import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, Smartphone, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { route } from 'ziggy-js';

export default function Login({ status, canResetPassword }) {
    const [loginMethod, setLoginMethod] = useState('email');
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleInputChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-900 sm:px-6 lg:px-8">
            <Head title="Log in" />

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-6 space-x-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500">
                            <span className="text-xl font-bold text-white">AI</span>
                        </div>
                        <span className="text-2xl font-bold text-white">CryptoAI</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="mt-2 text-gray-400">Sign in to your account to continue</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-400 text-center">
                        {status}
                    </div>
                )}

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Login Method Tabs */}
                        {/* <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-gray-700/50">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    loginMethod === 'email'
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <Mail className="w-4 h-4 mr-1" />
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('phone')}
                                className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    loginMethod === 'phone'
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <Smartphone className="w-4 h-4 mr-1" />
                                Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('telegram')}
                                className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    loginMethod === 'telegram'
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Telegram
                            </button>
                        </div> */}

                        {/* Login Fields */}

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </div>
                            {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className="ml-2 text-sm text-gray-300">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm transition-colors text-cyan-400 hover:text-cyan-300"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link href={route('register')} className="font-medium transition-colors text-cyan-400 hover:text-cyan-300">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
