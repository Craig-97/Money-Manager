import { PayFrequency } from '~/graphql/generated';
import { PAY_FREQUENCY_LABELS } from '~/lib/payday';

export const FREQUENCIES = (Object.keys(PAY_FREQUENCY_LABELS) as PayFrequency[]).map(value => ({
  value,
  label: PAY_FREQUENCY_LABELS[value]
}));
