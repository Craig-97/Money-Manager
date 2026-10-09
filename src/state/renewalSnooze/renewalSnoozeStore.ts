import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// How long "Later" puts away a renewal that has gone by, before it asks again
const SNOOZE_DAYS = 3;
const DAY_MS = 86_400_000;

/* One renewal, by its payment and date: setting the next renewal makes a new one */
export const renewalKey = (paymentId: string, renewalDate: Date) =>
  `${paymentId}:${renewalDate.getFullYear()}-${renewalDate.getMonth() + 1}-${renewalDate.getDate()}`;

interface RenewalSnoozeState {
  // Renewal key -> when it asks again, in epoch milliseconds
  until: Record<string, number>;
  snooze: (key: string, now?: number) => void;
}

/*
 * Renewals put away with "Later" on the dashboard. Kept in this browser only: it's a nudge, so
 * it showing again on another device is fine.
 */
export const useRenewalSnoozeStore = create<RenewalSnoozeState>()(
  persist(
    set => ({
      until: {},
      snooze: (key, now = Date.now()) =>
        set(state => ({
          // Ones that have run out are dropped as new ones are added, so the list stays short
          until: Object.fromEntries(
            [...Object.entries(state.until), [key, now + SNOOZE_DAYS * DAY_MS]].filter(
              ([, until]) => (until as number) > now
            )
          )
        }))
    }),
    { name: 'mm-renewal-snooze', version: 1 }
  )
);

/* Whether a renewal is put away for now */
export const isSnoozed = (until: Record<string, number>, key: string, now = Date.now()) =>
  (until[key] ?? 0) > now;
