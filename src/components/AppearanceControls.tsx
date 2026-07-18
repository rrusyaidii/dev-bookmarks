'use client';

import { useAppearance } from '@/hooks/use-appearance';
import { THEME_META, THEMES, type ThemeId } from '@/lib/theme';

export function ModeToggle({ className = '' }: { className?: string }) {
  const { appearance, flipMode } = useAppearance();
  const next = appearance.mode === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={flipMode}
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} mode`}
      className={`flex size-11 cursor-pointer items-center justify-center text-muted transition-colors duration-200 hover:text-accent ${className}`}
    >
      {appearance.mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function AppearanceControls({ collapsed }: { collapsed: boolean }) {
  const { appearance, setTheme } = useAppearance();

  if (collapsed) {
    return (
      <div className="flex justify-center border-t border-border py-2">
        <ModeToggle />
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Appearance
        </span>
        <ModeToggle className="size-9" />
      </div>
      <div className="flex items-center gap-2" role="listbox" aria-label="Theme">
        {THEMES.map((id) => (
          <ThemeSwatch
            key={id}
            id={id}
            active={appearance.theme === id}
            mode={appearance.mode}
            onSelect={setTheme}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeSwatch({
  id,
  active,
  mode,
  onSelect,
}: {
  id: ThemeId;
  active: boolean;
  mode: 'dark' | 'light';
  onSelect: (id: ThemeId) => void;
}) {
  const meta = THEME_META[id];
  const color = mode === 'dark' ? meta.swatchDark : meta.swatchLight;

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      title={meta.label}
      aria-label={`${meta.label} theme`}
      onClick={() => onSelect(id)}
      className={`size-8 cursor-pointer rounded-[6px] border transition-colors duration-200 ${
        active
          ? 'border-accent ring-2 ring-accent/40'
          : 'border-border hover:border-muted'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z" />
    </svg>
  );
}
