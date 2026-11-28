import { PaymentSort } from '~/lib/payments';

export interface SortProps {
  sort: PaymentSort;
  onSort: (sort: PaymentSort) => void;
}
