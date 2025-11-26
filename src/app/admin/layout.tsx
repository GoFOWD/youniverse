'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = () => {
        // Clear cookie by setting it to expire
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/admin/login');
    };

    const navItems = [
        { name: '대시보드', href: '/admin' },
        { name: '질문 관리', href: '/admin/questions' },
        { name: '점수 산정', href: '/admin/scoring' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 p-6 flex flex-col">
                <h1 className="text-2xl font-bold mb-8 text-white">관리자</h1>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-white text-black font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto px-4 py-2 text-left text-gray-400 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors"
                >
                    로그아웃
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
