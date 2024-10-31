import { PAYMENT_TYPE } from '../types';

export interface Bill {
  id?: string;
  name?: string;
  amount?: number;
  paid?: boolean;
  account?: string;
  __typename?: PAYMENT_TYPE['BILL'];
}

export interface EditBillResponse {
  editBill: {
    bill: Bill;
    success: boolean;
  };
}
