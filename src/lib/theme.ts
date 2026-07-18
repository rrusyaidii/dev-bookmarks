export const THEMES = ['forge', 'ink', 'ember', 'moss'] as const;
export const MODES = ['dark', 'light'] as const;

export type ThemeId = (typeof THEMES)[number];
export type ModeId = (typeof MODES)[number];

export type Appearance = {
  theme: ThemeId;
  mode: ModeId;
};

export const THEME_META: Record<
  ThemeId,
  { label: string; swatchDark: string; swatchLight: string }
> = {
  forge: { label: 'Beacon', swatchDark: '#ff5c4d', swatchLight: '#e03e30' },
  ink: { label: 'Ink', swatchDark: '#5eb0ff', swatchLight: '#1d6fb8' },
  ember: { label: 'Ember', swatchDark: '#ff7a59', swatchLight: '#d44528' },
  moss: { label: 'Moss', swatchDark: '#3ecf8e', swatchLight: '#0d8f5b' },
};

export const STORAGE_THEME = 'devmark-theme';
export const STORAGE_MODE = 'devmark-mode';

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'forge',
  mode: 'dark',
};

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.includes(value as ThemeId);
}

export function isModeId(value: string | null | undefined): value is ModeId {
  return MODES.includes(value as ModeId);
}

export function getStoredAppearance(): Appearance {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE;

  const themeRaw = window.localStorage.getItem(STORAGE_THEME);
  const modeRaw = window.localStorage.getItem(STORAGE_MODE);

  return {
    theme: isThemeId(themeRaw) ? themeRaw : DEFAULT_APPEARANCE.theme,
    mode: isModeId(modeRaw) ? modeRaw : DEFAULT_APPEARANCE.mode,
  };
}

export const APPEARANCE_EVENT = 'devmark-appearance';

export function applyAppearance({ theme, mode }: Appearance): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-mode', mode);
  window.localStorage.setItem(STORAGE_THEME, theme);
  window.localStorage.setItem(STORAGE_MODE, mode);
  // Defer so other ModeToggle instances don't setState during this update
  queueMicrotask(() => {
    window.dispatchEvent(new Event(APPEARANCE_EVENT));
  });
}

export function toggleMode(current: ModeId): ModeId {
  return current === 'dark' ? 'light' : 'dark';
}

/** Inline script body for FOUC-free boot (no imports). */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_THEME}');var m=localStorage.getItem('${STORAGE_MODE}');var themes=['forge','ink','ember','moss'];var modes=['dark','light'];var theme=themes.indexOf(t)>-1?t:'forge';var mode=modes.indexOf(m)>-1?m:'dark';var r=document.documentElement;r.setAttribute('data-theme',theme);r.setAttribute('data-mode',mode);}catch(e){}})();`;
