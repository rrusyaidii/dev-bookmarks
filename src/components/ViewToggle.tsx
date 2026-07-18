'use client';

import { useEffect, useState } from 'react';
import {
  getStoredViewMode,
  setStoredViewMode,
  VIEW_EVENT,
  type ViewMode,
} from '@/lib/view-mode';

export default function ViewToggle() {
  const [mode, setMode] = useState<ViewMode>('list');

  useEffect(() => {
    const sync = () => setMode(getStoredViewMode());
    sync();
    window.addEventListener(VIEW_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(VIEW_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const select = (next: ViewMode) => {
    setMode(next);
    setStoredViewMode(next);
  };

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="View layout"
    >
      <ToggleBtn active={mode === 'list'} onClick={() => select('list')} label="List">
        <ListIcon />
      </ToggleBtn>
      <ToggleBtn active={mode === 'cards'} onClick={() => select('cards')} label="Cards">
        <CardsIcon />
      </ToggleBtn>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`flex min-h-10 cursor-pointer items-center gap-1.5 border-b-2 px-0.5 pb-1 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 ${
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-muted hover:text-fg'
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
