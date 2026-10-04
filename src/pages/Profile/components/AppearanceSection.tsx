import { ReactNode } from 'react';
import { Check, Monitor, Sun } from 'lucide-react';
import { MoonIcon } from '~/components/icons';
import { useTheme } from '~/hooks/useTheme';
import { cn } from '~/lib/cn';
import { ACCENTS, ThemePreference, usePrefsStore } from '~/state/prefs';
import { SECTION_ICONS } from './ProfileNav';
import { helpClasses, SettingsTile } from './SettingsTile';

const THEMES: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: 'dark', label: 'Dark', icon: <MoonIcon size={16} /> },
  { value: 'light', label: 'Light', icon: <Sun size={16} aria-hidden="true" /> },
  { value: 'system', label: 'System', icon: <Monitor size={16} aria-hidden="true" /> }
];

const ACCENT_NAMES: Record<(typeof ACCENTS)[number], string> = {
  '#7C3AED': 'Violet',
  '#3D6BF5': 'Blue',
  '#0F9F8F': 'Teal',
  '#2F8F4E': 'Green',
  '#E5484D': 'Red',
  '#EA580C': 'Orange',
  '#DB2777': 'Pink'
};

const SettingRow = ({
  labelId,
  label,
  help,
  children
}: {
  labelId: string;
  label: string;
  help: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border py-[18px] first:border-t-0 first:pt-1 last:pb-0">
    <div className="flex min-w-0 flex-col gap-1">
      <span id={labelId} className="text-[13px] font-bold">
        {label}
      </span>
      <p className={helpClasses}>{help}</p>
    </div>
    {children}
  </div>
);

/* Theme and accent colour */
export const AppearanceSection = () => {
  const { preference, setTheme } = useTheme();
  const accent = usePrefsStore(s => s.accent);
  const setAccent = usePrefsStore(s => s.setAccent);

  return (
    <SettingsTile
      id="appearance"
      icon={SECTION_ICONS.appearance}
      title="Appearance"
      // TODO(phase 4): save these on the user so they follow you to other devices
      description="Saved on this device."
      mobileDescription="Saved on this device.">
      <div>
        <SettingRow
          labelId="appearance-theme"
          label="Theme"
          help="System follows your device setting.">
          <div
            role="group"
            aria-labelledby="appearance-theme"
            className="flex w-full gap-1 rounded-full border border-border bg-surface-2 p-1 md:w-auto">
            {THEMES.map(theme => (
              <button
                key={theme.value}
                type="button"
                aria-pressed={preference === theme.value}
                onClick={() => setTheme(theme.value)}
                className="inline-flex h-[42px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[13px] font-bold text-muted transition-colors hover:text-text aria-pressed:bg-pill-active-bg aria-pressed:text-pill-active-text">
                {theme.icon}
                {theme.label}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow
          labelId="appearance-accent"
          label="Accent colour"
          help="Used for buttons, highlights and your payday countdown.">
          <div role="group" aria-labelledby="appearance-accent" className="flex flex-wrap gap-2.5">
            {ACCENTS.map(colour => {
              const on = accent.toUpperCase() === colour;
              return (
                <button
                  key={colour}
                  type="button"
                  aria-label={ACCENT_NAMES[colour]}
                  aria-pressed={on}
                  onClick={() => setAccent(colour)}
                  style={{ backgroundColor: colour }}
                  className={cn(
                    'flex size-11 cursor-pointer items-center justify-center rounded-full text-white transition-[box-shadow,transform] hover:scale-105',
                    on && 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--text)]'
                  )}>
                  {on ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </SettingRow>
      </div>
    </SettingsTile>
  );
};
