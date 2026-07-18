'use client';

import Link from 'next/link';

export default function QuickAddButton() {
  return (
    <Link
      href="/add"
      title="Add bookmark"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-20 flex size-14 cursor-pointer items-center justify-center rounded-[10px] bg-accent text-[#07080c] shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-accent-dim hover:text-fg md:bottom-6 md:right-6"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
