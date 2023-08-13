import { TYPES } from '~/constants';

export interface OneOffPayment {
  id?: string;
  name?: string;
  amount?: number;
  account?: string;
  __typename?: TYPES.ONEOFFPAYMENT;
}
