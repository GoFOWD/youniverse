'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Admin pages: full width, no wrapper
    return <div className="min-h-screen">{children}</div>;
  }

  // Regular pages: mobile-first 430px max-width design
  return (
    <div className="bg-[#1a1a1a] flex justify-center min-h-screen">
      <div className="w-full max-w-[430px] min-h-screen bg-black relative shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
