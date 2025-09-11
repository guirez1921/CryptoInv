import { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Mail, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { route } from 'ziggy-js';

export default function VerifyEmail({ status }) {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const { post, processing } = useForm();

    useEffect(() => {
        let interval = null;
        if (timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timeRemaining]);

    const submit = (e) => {
        e.preventDefault();

        if (!canResend || processing) return;

        post(route('verification.send'), {
            onSuccess: () => {
                setCanResend(false);
                setTimeRemaining(60); // 1 minute cooldown
            },
        });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleLogout = (e) => {
        e.preventDefault()
        router.post(route('logout'));
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-900 sm:px-6 lg:px-8">
            <Head title="Verify Email" />

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-6 space-x-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500">
                            <span className="text-xl font-bold text-white">AI</span>
                        </div>
                        <span className="text-2xl font-bold text-white">CryptoAI</span>
                    </div>

                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500">
                        <Mail className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                        We've sent a verification link to your email address.
                        Please check your inbox and click the link to verify your account.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-700/50">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                            <p className="text-sm text-green-400">
                                A new verification link has been sent to your email address.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50">
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/50">
                                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-300 mb-2">
                                    Didn't receive the email? Check your spam folder or request a new one.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            <button
                                type="submit"
                                disabled={!canResend || processing}
                                className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${!canResend || processing
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white transform hover:scale-[1.02]'
                                    }`}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Sending...
                                    </div>
                                ) : !canResend ? (
                                    <div className="flex items-center justify-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Resend in {formatTime(timeRemaining)}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Resend Verification Email
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="text-center space-y-4">
                            <div className="border-t border-gray-700"></div>

                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm">
                                    Already verified your email?{' '}
                                    <Link
                                        href={route('dashboard')}
                                        className="font-medium transition-colors text-cyan-400 hover:text-cyan-300"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </p>

                                <p className="text-gray-400 text-sm">
                                    Want to use a different email?{' '}
                                    <Link
                                        href={route('profile.edit')}
                                        className="font-medium transition-colors text-cyan-400 hover:text-cyan-300"
                                    >
                                        Update Profile
                                    </Link>
                                </p>

                                <button
                                    className="text-sm font-medium transition-colors text-gray-500 hover:text-gray-400 underline"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="text-yellow-400 text-sm font-bold">!</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            <p className="font-medium text-gray-300 mb-1">Having trouble?</p>
                            <p>
                                If you don't receive the email within a few minutes, please check your spam folder
                                or contact our support team for assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}