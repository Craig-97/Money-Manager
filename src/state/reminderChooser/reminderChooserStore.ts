import { create } from 'zustand';

interface ReminderChooserState {
  open: boolean;
  show: () => void;
  close: () => void;
}

/*
 * Adding from Reminders asks what's being added: a note with a date, or a recurring payment. It
 * lives in a store so the mobile nav's add button can open it.
 */
export const useReminderChooserStore = create<ReminderChooserState>()(set => ({
  open: false,
  show: () => set({ open: true }),
  close: () => set({ open: false })
}));
