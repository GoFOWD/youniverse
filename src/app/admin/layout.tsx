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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col lg:flex-row">
            {/* Mobile Header with Hamburger Menu */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-green-800">
                <h1 className="text-xl font-bold text-green-500 tracking-tighter">
                    <span className="mr-2 animate-pulse">█</span>
                    ADMIN_CONSOLE
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 border border-green-700 text-green-500 hover:bg-green-900/20"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Sidebar - Hidden on mobile by default, shown as overlay when menu is open */}
            <aside className={`
                fixed lg:static inset-0 z-50 lg:z-auto
                w-full lg:w-64 
                bg-black lg:bg-transparent
                border-r border-green-800 
                p-6 flex flex-col
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Desktop Header (hidden on mobile) */}
                <h1 className="hidden lg:block text-2xl font-bold mb-8 text-green-500 tracking-tighter">
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
                                onClick={() => setIsMobileMenuOpen(false)}
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

                {/* Close button for mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden mt-4 px-4 py-2 border border-green-700 text-green-500 hover:bg-green-900/20 uppercase text-sm text-center"
                >
                    Close Menu
                </button>
            </aside>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-black">
                {children}
            </main>
        </div>
    );
}
