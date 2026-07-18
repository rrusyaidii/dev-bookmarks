'use client';

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { ReactNode, useState, useCallback } from 'react';

export default function DashboardShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        userEmail={userEmail}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ${
          collapsed ? 'md:ml-16' : 'md:ml-56'
        }`}
      >
        <TopBar onMenuToggle={toggleMobile} userEmail={userEmail} />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
