import { TYPES } from '~/constants';

export interface Bill {
  id?: string;
  name?: string;
  amount?: number;
  paid?: boolean;
  account?: string;
  __typename?: TYPES.BILL;
}
