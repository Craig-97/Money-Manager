import { daysBetween, PaydayConfig } from '~/lib/dates';
import { BankHolidays, getNextPaydayDates, getNextPaydays } from '~/lib/payday';
import { PASSWORD_RULES } from '~/lib/validation';

export type SectionId =
  | 'personal'
  | 'password'
  | 'payday'
  | 'payments'
  | 'balances'
  | 'reminders'
  | 'appearance'
  | 'account';

// The settings sections, in page order. `short` is the mobile jump chip.
export const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  { id: 'personal', label: 'Personal details', short: 'Details' },
  { id: 'password', label: 'Password', short: 'Password' },
  { id: 'payday', label: 'Payday', short: 'Payday' },
  { id: 'payments', label: 'Payments', short: 'Payments' },
  { id: 'balances', label: 'Balances', short: 'Balances' },
  { id: 'reminders', label: 'Reminders', short: 'Reminders' },
  { id: 'appearance', label: 'Appearance', short: 'Appearance' },
  { id: 'account', label: 'Account', short: 'Account' }
];

// ---- password strength ----

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

/*
 * A rough 0-4 score: one each for 8+ characters, a number, mixed case, and a symbol or 12+
 * characters. The API only insists on the first two.
 */
export const passwordStrength = (password: string) => {
  if (!password) return { score: 0, label: '' };
  const score = [
    ...PASSWORD_RULES.map(rule => rule.test(password)),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 12
  ].filter(Boolean).length;
  return { score, label: STRENGTH_LABELS[Math.max(score, 1)] };
};

// ---- payday ----

const PREVIEW_COUNT = 3;
const NO_HOLIDAYS: BankHolidays = new Set();

export interface PaydayPreview {
  date: Date;
  // The date the rule gives (bank holidays allowed for), which a move by the user attaches to
  usual: Date;
  // Moved by the user from `usual`
  moved: boolean;
  // The date it would have been, when a bank holiday moved it
  movedFrom: Date | null;
}

/* The next few paydays, marking any a bank holiday or the user moved */
export const paydayPreview = (
  config: PaydayConfig,
  { holidays, today }: { holidays: BankHolidays; today: Date }
): PaydayPreview[] => {
  // Weekends are allowed for in both lists, so any difference is a bank holiday
  const before = getNextPaydays(
    { ...config, overrides: [] },
    { holidays: NO_HOLIDAYS, from: today, count: PREVIEW_COUNT }
  );
  return getNextPaydayDates(config, { holidays, from: today, count: PREVIEW_COUNT }).map(
    ({ date, usual }, index) => {
      const original = before[index];
      const heldBack =
        !usual && original && original > date && daysBetween(date, original) < 7 ? original : null;
      return { date, usual: usual ?? date, moved: !!usual, movedFrom: heldBack };
    }
  );
};
