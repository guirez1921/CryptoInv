import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminHeader from '@/Component/Admin/Layout/AdminHeader';
import AdminSidebar from '@/Component/Admin/Layout/AdminSidebar';
import FloatingChat from '@/Component/Layout/Chat';

export default function CryptoAIAdminLayout({ children, title = 'Admin Dashboard' }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const notificationCount = auth?.notificationCount || 0;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title={title} />
            <div className="flex flex-col h-screen bg-gray-900">
                {/* Header */}
                <AdminHeader
                    user={user}
                    notificationCount={notificationCount}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="relative flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
                        {/* Admin might not need floating chat, or might need a different one? 
                            Keeping it for now as they might chat with users. */}
                        {/* <FloatingChat auth={auth} /> */}
                    </main>
                </div>
            </div>
        </>
    );
}
