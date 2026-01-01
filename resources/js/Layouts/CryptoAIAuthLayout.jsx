import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedHeader from '@/component/Layout/AuthenticatedHeader';
import Sidebar from '@/component/Layout/Sidebar';
import FloatingChat from '@/Component/Layout/Chat';
import BalanceAnalysisModal from '@/Component/UI/BalanceAnalysisModal';

export default function CryptoAIAuthLayout({ children, title = 'CryptoAI Dashboard' }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const account = auth?.account || null;
    const notificationCount = auth?.notificationCount || 0;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

    return (
        <>
            <Head title={title} />
            <div className="flex flex-col h-screen bg-gray-900">
                {/* Header */}
                <AuthenticatedHeader
                    user={user}
                    account={account}
                    notificationCount={notificationCount}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    setIsBalanceModalOpen={setIsBalanceModalOpen}
                />

                <div className="relative flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    {/* Backdrop for mobile */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-gray-900/80 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                    )}

                    {/* Main content area with sidebar offset */}
                    <main className="flex-1 pt-0 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            {children}
                        </div>
                        <FloatingChat auth={auth} />
                    </main>
                </div>

                {/* Balance Analysis Modal - Root level of layout */}
                <BalanceAnalysisModal
                    account={account}
                    isOpen={isBalanceModalOpen}
                    onClose={() => setIsBalanceModalOpen(false)}
                />
            </div>
        </>
    );
}
