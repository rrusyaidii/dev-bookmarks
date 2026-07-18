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
    <div className="flex min-h-screen">
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          collapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        <TopBar onMenuToggle={toggleMobile} userEmail={userEmail} />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
