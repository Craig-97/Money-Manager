import { create } from 'zustand';

interface TourState {
  // The step showing, counted from 0; null when the tour isn't running
  step: number | null;
  start: () => void;
  goTo: (step: number) => void;
  stop: () => void;
}

/* The first-time tour, started after Setup's welcome or from Profile's Help */
export const useTourStore = create<TourState>()(set => ({
  step: null,
  start: () => set({ step: 0 }),
  goTo: step => set({ step }),
  stop: () => set({ step: null })
}));
