import { formatLabel } from './shared';
import { PAYMENT_CATEGORY } from '~/constants';

export const getOneOffCategoryOptions = () =>
  Object.values(PAYMENT_CATEGORY).map(value => ({
    value,
    label: formatLabel(value)
  }));
