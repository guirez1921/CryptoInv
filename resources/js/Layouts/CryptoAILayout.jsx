import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/component/Layout/Header';
import Footer from '@/component/Layout/Footer';

export default function CryptoAILayout({ children, title = 'CryptoAI', showHeader = true, showFooter = true }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAuthenticated = !!user;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-900 flex flex-col">
                {showHeader && (
                    <Header
                        isAuthenticated={isAuthenticated}
                        user={user}
                    />
                )}
                <main className="flex-1">
                    {children}
                </main>

                {showFooter && <Footer />}
            </div>
        </>
    );
}
