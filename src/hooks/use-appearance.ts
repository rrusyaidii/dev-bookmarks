'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APPEARANCE_EVENT,
  applyAppearance,
  DEFAULT_APPEARANCE,
  getStoredAppearance,
  toggleMode,
  type Appearance,
  type ModeId,
  type ThemeId,
} from '@/lib/theme';

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [ready, setReady] = useState(false);
  const appearanceRef = useRef(appearance);
  appearanceRef.current = appearance;

  useEffect(() => {
    const sync = () => {
      const next = getStoredAppearance();
      setAppearance((prev) =>
        prev.theme === next.theme && prev.mode === next.mode ? prev : next
      );
    };
    sync();
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'devmark-theme' && e.key !== 'devmark-mode') return;
      sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(APPEARANCE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(APPEARANCE_EVENT, sync);
    };
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    const next = { ...appearanceRef.current, theme };
    applyAppearance(next);
    setAppearance(next);
  }, []);

  const setMode = useCallback((mode: ModeId) => {
    const next = { ...appearanceRef.current, mode };
    applyAppearance(next);
    setAppearance(next);
  }, []);

  const flipMode = useCallback(() => {
    const next = {
      ...appearanceRef.current,
      mode: toggleMode(appearanceRef.current.mode),
    };
    applyAppearance(next);
    setAppearance(next);
  }, []);

  return { appearance, ready, setTheme, setMode, flipMode };
}
