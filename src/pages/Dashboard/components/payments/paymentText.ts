import { PaymentTab } from '../../dashboardModel';

export const EMPTY_TEXT: Record<PaymentTab, { title: string; body: string; button: string }> = {
  upcoming: {
    title: 'Nothing due before payday',
    body: 'Add a payment and it will show here',
    button: 'Add a payment'
  },
  recurring: {
    title: 'No recurring payments yet',
    body: 'Bills and subscriptions that repeat will show here',
    button: 'Add recurring payment'
  },
  oneOff: {
    title: 'No one-off payments yet',
    body: 'A single expense or income on a date will show here',
    button: 'Add one-off payment'
  }
};

/* What the list footer says about the tab */
export const footLabel = (count: number, tab: PaymentTab, payday: string) =>
  `${count} ${count === 1 ? 'payment' : 'payments'}` +
  (tab === 'upcoming'
    ? ` before payday · ${payday}`
    : tab === 'recurring'
      ? ' · recurring'
      : ' · one-off');
