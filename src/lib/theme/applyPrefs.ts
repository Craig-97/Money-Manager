import { Theme } from '~/state/prefs';

const THEME_COLOR: Record<Theme, string> = { dark: '#0E1013', light: '#EEF0F3' };

// The blue accent has hand-tuned text and soft colours, switched on in tokens.css
const BLUE_ACCENT = '#3D6BF5';

/* Applies the theme and accent to the document. Mirrors the inline script in index.html. */
export const applyPrefs = ({ theme, accent }: { theme: Theme; accent: string }) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.setProperty('--accent', accent);

  if (accent.toUpperCase() === BLUE_ACCENT) {
    root.dataset.accent = 'blue';
  } else {
    delete root.dataset.accent;
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
};
