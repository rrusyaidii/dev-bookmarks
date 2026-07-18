export const VIEW_MODES = ['list', 'cards'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const STORAGE_VIEW = 'devmark-view';
export const VIEW_EVENT = 'devmark-view';
export const DEFAULT_VIEW: ViewMode = 'list';

export function isViewMode(value: string | null | undefined): value is ViewMode {
  return VIEW_MODES.includes(value as ViewMode);
}

export function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return DEFAULT_VIEW;
  const raw = window.localStorage.getItem(STORAGE_VIEW);
  return isViewMode(raw) ? raw : DEFAULT_VIEW;
}

export function setStoredViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_VIEW, mode);
  window.dispatchEvent(new Event(VIEW_EVENT));
}
