import { SegmentedOption } from '~/components/ui/SegmentedControl';
import { PaymentCategory, PaymentType } from '~/graphql/generated';
import { categoriesFor, categoryLabel, FREQUENCIES, FREQUENCY_LABELS } from '~/lib/payments';
import { Ends } from './usePaymentForm';

// The choices the payment form offers

export const FREQUENCY_OPTIONS = FREQUENCIES.map(value => ({
  value,
  label: FREQUENCY_LABELS[value]
}));

/*
 * The categories for money in or out. One a payment already has stays on offer, even if it
 * doesn't suit the type, so editing the payment doesn't lose it.
 */
export const categoryOptions = (type: PaymentType, current: PaymentCategory) => {
  const categories = categoriesFor(type);
  return (categories.includes(current) ? categories : [current, ...categories]).map(value => ({
    value,
    label: categoryLabel(value)
  }));
};

export const ENDS_OPTIONS: SegmentedOption<Ends>[] = [
  { value: 'keep', label: 'Keeps going' },
  { value: 'renew', label: 'Renews' },
  { value: 'stop', label: 'Stops' }
];

export const TYPES: { value: PaymentType; label: string; dot: string }[] = [
  { value: 'EXPENSE', label: 'Expense', dot: 'bg-expense' },
  { value: 'INCOME', label: 'Income', dot: 'bg-income' }
];
