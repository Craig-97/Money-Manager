import { useShallow } from 'zustand/react/shallow';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Toaster } from '~/components/ui/Toaster';
import { cn } from '~/lib/cn';
import { ACCENTS, Theme, usePrefsStore } from '~/state/prefs';
import {
  ButtonsSection,
  ChoicesSection,
  FieldsSection,
  OverlaysSection,
  PickersSection,
  SurfacesSection
} from './components';

/* Dev only: every UI kit component in its states, for comparing against the design */
export const Kit = () => {
  const { theme, accent, setTheme, setAccent } = usePrefsStore(
    useShallow(s => ({
      theme: s.theme,
      accent: s.accent,
      setTheme: s.setTheme,
      setAccent: s.setAccent
    }))
  );

  return (
    <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">Development only</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em]">UI kit</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Theme"
            size="md"
            value={theme}
            onValueChange={value => setTheme(value as Theme)}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' }
            ]}
          />
          <div role="group" aria-label="Accent" className="flex gap-1">
            {ACCENTS.map(colour => (
              <button
                key={colour}
                type="button"
                aria-label={`Accent ${colour}`}
                aria-pressed={accent === colour}
                onClick={() => setAccent(colour)}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-hover">
                <span
                  className={cn(
                    'size-6 rounded-full',
                    accent === colour && 'shadow-[0_0_0_3px_var(--bg),0_0_0_5px_var(--text)]'
                  )}
                  style={{ background: colour }}
                />
              </button>
            ))}
          </div>
        </div>
      </header>

      <ButtonsSection />
      <FieldsSection />
      <ChoicesSection />
      <PickersSection />
      <OverlaysSection />
      <SurfacesSection />
      <Toaster />
    </main>
  );
};
