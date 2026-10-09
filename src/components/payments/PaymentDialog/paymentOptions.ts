import { SegmentedOption } from '~/components/ui/SegmentedControl';
import { PaymentType } from '~/graphql/generated';
import {
  categoryLabel,
  FREQUENCIES,
  FREQUENCY_LABELS,
  ONE_OFF_CATEGORIES,
  RECURRING_CATEGORIES,
  REMINDER_DAYS,
  REMINDER_LABELS
} from '~/lib/payments';
import { Ends } from './usePaymentForm';

// The choices the payment form offers

export const FREQUENCY_OPTIONS = FREQUENCIES.map(value => ({
  value,
  label: FREQUENCY_LABELS[value]
}));

export const RECURRING_OPTIONS = RECURRING_CATEGORIES.map(value => ({
  value,
  label: categoryLabel(value)
}));

export const ONE_OFF_OPTIONS = ONE_OFF_CATEGORIES.map(value => ({
  value,
  label: categoryLabel(value)
}));

export const ENDS_OPTIONS: SegmentedOption<Ends>[] = [
  { value: 'keep', label: 'Keeps going' },
  { value: 'renew', label: 'Renews' },
  { value: 'stop', label: 'Stops' }
];

export const REMINDER_OPTIONS = REMINDER_DAYS.map(days => ({
  value: String(days),
  label: REMINDER_LABELS[days]
}));

export const TYPES: { value: PaymentType; label: string; dot: string }[] = [
  { value: 'EXPENSE', label: 'Expense', dot: 'bg-expense' },
  { value: 'INCOME', label: 'Income', dot: 'bg-income' }
];
