import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, Smartphone, Eye, EyeOff } from 'lucide-react';
import { route } from 'ziggy-js';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        agree_terms: false,
        enable_kyc: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Register" />
            
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">AI</span>
                        </div>
                        <span className="text-white font-bold text-2xl">CryptoAI</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-gray-400 mt-2">Join thousands of investors earning with AI</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    autoFocus
                                    required
                                />
                            </div>
                            {errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
                        </div>

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
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
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

                        <div className="space-y-2">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-200">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password_confirmation && <div className="text-red-400 text-sm mt-1">{errors.password_confirmation}</div>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
                                Phone Number (Optional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Smartphone className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            {errors.phone && <div className="text-red-400 text-sm mt-1">{errors.phone}</div>}
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="enable_kyc"
                                    checked={data.enable_kyc}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-0.5"
                                />
                                <span className="ml-3 text-sm text-gray-300">
                                    Enable KYC verification (recommended for higher limits)
                                </span>
                            </label>

                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agree_terms"
                                    checked={data.agree_terms}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-0.5"
                                    required
                                />
                                <span className="ml-3 text-sm text-gray-300">
                                    I agree to the{' '}
                                    <a href="#" className="text-cyan-400 hover:text-cyan-300">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-cyan-400 hover:text-cyan-300">
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>
                            {errors.agree_terms && <div className="text-red-400 text-sm mt-1">{errors.agree_terms}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.agree_terms}
                            className={`w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${processing || !data.agree_terms ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link href={route('login')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
