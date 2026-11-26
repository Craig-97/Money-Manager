import { PageName } from '~/app/routes/pageModules';

// What the tour can light up, found by its data-tour attribute. A page's name is its nav link.
export type TourTarget =
  | 'free-to-spend'
  | 'next-payday'
  | 'monthly'
  | 'payments'
  | 'payday-example'
  | 'add'
  | 'more'
  | 'more-sheet'
  | PageName;

/* Marks an element for the tour: {...tourTarget('monthly')} */
export const tourTarget = (target: TourTarget) => ({ 'data-tour': target });

export interface TourStep {
  title: string;
  text: string;
  // Lit up and outlined
  spot?: TourTarget;
  // Lit up too, without an outline
  alsoLit?: readonly TourTarget[];
  // What the card sits beside, when that isn't the spot
  anchor?: TourTarget;
  // Mobile: the card goes above, unless it's below. Desktop finds the side with room.
  below?: boolean;
  // Mobile: More's pages are shown, as if it were open
  more?: boolean;
  // An example payday prompt is shown
  example?: boolean;
}

type StepText = Pick<TourStep, 'title' | 'text'>;

const pageStep = (page: PageName, { title, text }: StepText): TourStep => ({
  spot: page,
  title,
  text
});

// More is shown open, with the page's row outlined and the card just above it
const moreStep = (page: PageName, { title, text }: StepText): TourStep => ({
  spot: page,
  alsoLit: ['more-sheet', 'more'],
  anchor: 'more-sheet',
  more: true,
  title,
  text
});

// The example prompt is lit and outlined like any other stop
const ON_PAYDAY = {
  spot: 'payday-example',
  example: true,
  title: 'On payday'
} as const;

export const DESKTOP_STEPS: readonly TourStep[] = [
  {
    spot: 'free-to-spend',
    title: 'Free to spend',
    text: 'What you can spend until payday: your bank balance minus everything still to go out before then. Keep the bank balance right with its pencil and the rest follows.'
  },
  {
    spot: 'next-payday',
    title: 'Days to payday',
    text: 'Each bar is a day of this pay cycle, and the dots show the days payments go out. Payday moves itself for weekends and bank holidays, and the pencil changes a single payday.'
  },
  {
    ...ON_PAYDAY,
    text: 'This opens by itself each payday. Check what has gone out, confirm the balance where you get paid, and the next pay cycle starts. Here is an example.'
  },
  {
    spot: 'monthly',
    title: 'Your month at a glance',
    text: 'Your income, what your regular payments cost each month, and your discretionary income, which is what is left. Yearly payments are kept separate, never averaged in.'
  },
  {
    spot: 'payments',
    title: 'Everything still to pay',
    text: 'Upcoming is what goes out before payday. Tick one off once it has gone, or use the menu at the end of a row to change it, skip it or see its payments.'
  },
  pageStep('recurring', {
    title: 'Recurring',
    text: 'All your regular payments and income in one place: what is still to pay this cycle, renewals coming up, and where the money goes by category.'
  }),
  pageStep('forecast', {
    title: 'Forecast',
    text: 'Looks ahead month by month, so you can see roughly where your balance will be after each payday.'
  }),
  pageStep('accounts', {
    title: 'Accounts',
    text: 'Your current account, savings and net worth after what you owe. Savings interest is added for you, and you choose which accounts count towards your bank balance.'
  }),
  pageStep('debts', {
    title: 'Debts',
    text: 'Loans and cards with their APR: what is left on each, when it will be paid off, and how much paying a bit extra would save.'
  }),
  pageStep('notes', {
    title: 'Notes',
    text: 'Somewhere for quotes, reference numbers and plans. Link a note to a payment, or give it a date to be reminded.'
  }),
  pageStep('reminders', {
    title: 'Reminders',
    text: 'Payments due, renewals, dated notes and interest added all land here. The bell at the top shows what is new.'
  }),
  pageStep('profile', {
    title: 'Profile',
    text: 'Your payday, how payments handle weekends and bank holidays, reminders and appearance. You can replay this tour from here at any time.'
  })
];

export const MOBILE_STEPS: readonly TourStep[] = [
  {
    spot: 'free-to-spend',
    below: true,
    title: 'Free to spend',
    text: 'What you can spend until payday: your bank balance minus everything still to go out before then. The bars count down the days.'
  },
  {
    ...ON_PAYDAY,
    text: 'This opens by itself each payday. Check what has gone out, confirm your balance, and the next cycle starts. Here is an example.'
  },
  {
    spot: 'monthly',
    title: 'Your month at a glance',
    text: 'Income, what your regular payments cost each month, and your discretionary income. Tap the pencils to update them.'
  },
  {
    spot: 'payments',
    title: 'Everything still to pay',
    text: 'Upcoming is what goes out before payday. Tap a payment to mark it paid, change it or skip it.'
  },
  {
    spot: 'add',
    title: 'Add anything',
    text: 'The + adds whatever the page you are on is about. Here it is a one-off or a recurring payment.'
  },
  pageStep('recurring', {
    title: 'Recurring',
    text: 'All your regular payments and income: what is still to pay this cycle, renewals coming up, and spending by category.'
  }),
  pageStep('forecast', {
    title: 'Forecast',
    text: 'Looks ahead month by month, so you can see roughly where your balance will be after each payday.'
  }),
  moreStep('accounts', {
    title: 'Accounts',
    text: 'Your current account, savings and net worth. Interest is added for you, and you choose which accounts count.'
  }),
  moreStep('debts', {
    title: 'Debts',
    text: 'Loans and cards: what is left, when each is paid off, and what paying extra would save.'
  }),
  moreStep('notes', {
    title: 'Notes',
    text: 'Quotes, reference numbers and plans. Link a note to a payment, or give it a date to be reminded.'
  }),
  moreStep('reminders', {
    title: 'Reminders',
    text: 'Payments due, renewals, dated notes and interest added. The bell at the top shows what is new.'
  }),
  moreStep('profile', {
    title: 'Profile',
    text: 'Your payday, weekends and bank holidays, reminders and appearance. You can replay this tour from here.'
  })
];
