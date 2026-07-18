'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_VIEW,
  getStoredViewMode,
  VIEW_EVENT,
  type ViewMode,
} from '@/lib/view-mode';

export function useViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>(DEFAULT_VIEW);

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

  return mode;
}
