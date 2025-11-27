'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    // Check authentication on mount and pathname change
    useEffect(() => {
        // Skip auth check on login page
        if (pathname === '/admin/login') {
            setIsChecking(false);
            return;
        }

        const checkAuth = () => {
            const cookies = document.cookie.split(';');
            const hasSession = cookies.some(cookie => cookie.trim().startsWith('admin_session='));

            if (!hasSession) {
                router.push('/admin/login');
            } else {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Show loading state while checking auth
    if (isChecking) {
        return <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
            <div className="text-center">
                <div className="text-xl mb-2">AUTHENTICATING...</div>
                <div className="text-xs text-green-700">Verifying credentials...</div>
            </div>
        </div>;
    }

    const handleLogout = () => {
        // Clear cookie by setting it to expire
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/admin/login');
    };

    const navItems = [
        { name: 'DASHBOARD', href: '/admin' },
        { name: 'QUESTIONS', href: '/admin/questions' },
        // Scoring page is merged into Questions
    ];

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-green-800 p-6 flex flex-col">
                <h1 className="text-2xl font-bold mb-8 text-green-500 tracking-tighter">
                    <span className="mr-2 animate-pulse">█</span>
                    ADMIN_CONSOLE
                </h1>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2 border-l-2 transition-all ${isActive
                                    ? 'border-green-500 bg-green-900/20 text-green-400 font-bold'
                                    : 'border-transparent text-green-700 hover:text-green-500 hover:border-green-800'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto px-4 py-2 text-left text-green-800 hover:text-red-500 hover:bg-red-900/10 border border-transparent hover:border-red-900 transition-colors uppercase text-sm"
                >
                    [ LOGOUT ]
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto bg-black">
                {children}
            </main>
        </div>
    );
}
