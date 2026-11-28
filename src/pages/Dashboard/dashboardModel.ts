import { formatShortDate } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { isInCycle, Payment, PaymentSort, sortPayments, summarise, Summary } from '~/lib/payments';

export type PaymentTab = 'upcoming' | 'recurring' | 'oneOff';

export const TABS: { value: PaymentTab; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'oneOff', label: 'One-off' }
];

// Whether a tab lists a payment
const inTab = (payment: Payment, { tab, cycle }: { tab: PaymentTab; cycle: PayCycle }) =>
  tab === 'upcoming' ? isInCycle(payment, cycle) : payment.kind === tab;

/* The payments a tab lists, in the chosen order */
export const paymentsForTab = (
  payments: Payment[],
  { tab, cycle, sort }: { tab: PaymentTab; cycle: PayCycle; sort: PaymentSort }
) =>
  sortPayments(
    payments.filter(payment => inTab(payment, { tab, cycle })),
    sort
  );

/* The tabs with how many each lists */
export const tabOptions = (payments: Payment[], { cycle }: { cycle: PayCycle }) =>
  TABS.map(tab => ({
    ...tab,
    count: payments.filter(payment => inTab(payment, { tab: tab.value, cycle })).length
  }));

/* What the cycle bar's tooltip says about a day */
export const dayTitle = (date: Date, { tags, today }: { tags: string[]; today: Date }) =>
  formatShortDate(date, today) + (tags.length ? ` · ${tags.join(' · ')}` : '');

interface OverridePreviewInput {
  payments: Payment[];
  bankBalance: number;
  monthlyIncome: number;
  cycle: PayCycle;
  today: Date;
  // The date the next payday would move to
  picked: Date;
}

/* What moving the next payday to another date does to the cycle, against how it stands */
export const overridePreview = ({ picked, ...input }: OverridePreviewInput) => {
  const before = summarise(input);
  const after = summarise({ ...input, cycle: { ...input.cycle, end: picked } });
  const names = (from: Summary, without: Summary) =>
    from.inCycle
      .filter(payment => !without.inCycle.some(other => other.id === payment.id))
      .map(payment => payment.name);

  return {
    daysBefore: before.daysToPayday,
    daysAfter: after.daysToPayday,
    freeBefore: before.freeToSpend,
    freeAfter: after.freeToSpend,
    // Payments that fall after the new payday, and ones that now fall before it
    leaving: names(before, after),
    joining: names(after, before)
  };
};
