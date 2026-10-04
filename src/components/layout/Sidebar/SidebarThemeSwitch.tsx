import { Sun } from 'lucide-react';
import { MoonIcon } from '~/components/icons';
import { Tooltip } from '~/components/ui/Tooltip';
import { useTheme } from '~/hooks/useTheme';
import { cn } from '~/lib/cn';
import { Theme } from '~/state/prefs';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const ThemeIcon = ({ theme, size }: { theme: Theme; size: number }) =>
  theme === 'light' ? <Sun size={size} aria-hidden="true" /> : <MoonIcon size={size} />;

/* A Light / Dark switch, or a single toggle button in the icon rail */
export const SidebarThemeSwitch = ({ expanded }: { expanded: boolean }) => {
  // With System chosen, the theme showing is the one marked
  const { theme, setTheme, toggleTheme } = useTheme();

  if (!expanded) {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const label = `Switch to ${next} theme`;

    return (
      <Tooltip label={label}>
        <button
          type="button"
          aria-label={label}
          onClick={toggleTheme}
          className="inline-flex size-[52px] shrink-0 cursor-pointer items-center justify-center self-center rounded-[18px] text-muted transition-colors hover:bg-hover hover:text-text">
          <ThemeIcon theme={next} size={20} />
        </button>
      </Tooltip>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="grid grid-cols-2 gap-0.5 rounded-full border border-border bg-surface-2 p-1">
      {THEMES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[13px] leading-none font-semibold text-muted hover:text-text',
            theme === value && 'bg-pill-active-bg text-pill-active-text hover:text-pill-active-text'
          )}>
          <ThemeIcon theme={value} size={15} />
          {label}
        </button>
      ))}
    </div>
  );
};
