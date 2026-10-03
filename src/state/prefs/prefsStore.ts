import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

// The accents offered by the design; the first is the default
export const ACCENTS = ['#7C3AED', '#3D6BF5', '#0F9F8F', '#E5484D'] as const;
export const DEFAULT_ACCENT = ACCENTS[0];

interface PrefsState {
  theme: Theme;
  accent: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccent: (accent: string) => void;
}

// TODO(phase 4): also save these on the user through the API so they follow you across devices.
// The storage key and shape are read by the inline script in index.html to avoid a theme flash.
export const usePrefsStore = create<PrefsState>()(
  persist(
    set => ({
      theme: 'dark',
      accent: DEFAULT_ACCENT,
      setTheme: theme => set({ theme }),
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setAccent: accent => set({ accent })
    }),
    {
      name: 'mm-prefs',
      version: 1,
      partialize: ({ theme, accent }) => ({ theme, accent })
    }
  )
);
