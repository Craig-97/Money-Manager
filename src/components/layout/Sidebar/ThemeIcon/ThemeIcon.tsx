import { Sun } from 'lucide-react';
import { MoonIcon } from '~/components/icons';
import { Theme } from '~/state/prefs';

/* The sun or moon for a theme */
export const ThemeIcon = ({ theme, size }: { theme: Theme; size: number }) =>
  theme === 'light' ? <Sun size={size} aria-hidden="true" /> : <MoonIcon size={size} />;
