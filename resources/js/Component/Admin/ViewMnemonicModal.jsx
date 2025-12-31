import React, { useState } from 'react';
import { Key, XCircle, AlertTriangle, Shield, Copy, CheckCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import Button from '@/component/UI/Button';

const ViewMnemonicModal = ({ user, onClose }) => {
    const [adminPassword, setAdminPassword] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [mnemonicError, setMnemonicError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleViewMnemonic = async () => {
        if (!adminPassword.trim()) {
            setMnemonicError('Please enter your password');
            return;
        }

        setIsLoading(true);
        setMnemonicError('');

        try {
            const response = await window.axios.post(route('admin.users.mnemonic', user.id), {
                password: adminPassword
            });

            const data = response.data;

            setMnemonic(data.mnemonic);
            setAdminPassword('');
            setShowMnemonic(true);
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.status === 403) {
                setMnemonicError(error.response.data.error || 'Invalid password.');
            } else {
                setMnemonicError('Failed to retrieve mnemonic. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyMnemonic = () => {
        navigator.clipboard.writeText(mnemonic);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">View Wallet Mnemonic</h3>
                            <p className="text-sm text-gray-400">Sensitive Information - Admin Access Only</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-semibold mb-1">Security Warning</p>
                            <p className="text-sm text-gray-300">
                                You are about to view the recovery phrase for <span className="font-semibold">{user.name}'s</span> wallet.
                                This action is logged for security purposes.
                            </p>
                        </div>
                    </div>
                </div>

                {!showMnemonic ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Your Admin Password
                        </label>
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleViewMnemonic()}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                            disabled={isLoading}
                        />
                        {mnemonicError && (
                            <p className="text-red-400 text-sm mt-2">{mnemonicError}</p>
                        )}

                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleViewMnemonic}
                                disabled={isLoading || !adminPassword.trim()}
                                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                            >
                                {isLoading ? 'Verifying...' : 'View Mnemonic'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Recovery Phrase (12 Words)
                            </label>
                            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                                <p className="text-white font-mono text-sm break-words select-all">
                                    {mnemonic}
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <p className="text-red-400 text-sm">
                                ⚠️ <strong>Never share this phrase with anyone.</strong> Anyone with this phrase can access this wallet and steal all funds.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {mnemonic.split(' ').map((word, index) => (
                                <div key={index} className="bg-gray-700 border border-gray-600 rounded px-3 py-2">
                                    <span className="text-gray-400 text-xs mr-2">{index + 1}.</span>
                                    <span className="text-white font-medium">{word}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <Button variant="outline" onClick={copyMnemonic}>
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Phrase
                                    </>
                                )}
                            </Button>
                            <Button onClick={onClose} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewMnemonicModal;
