import { PaymentType } from './oneOffPayment';
import { PaymentTypeName } from './payment';

export interface Bill {
  id?: string;
  name?: string;
  amount?: number;
  paid?: boolean;
  account?: string;
  type?: PaymentType;
  __typename?: PaymentTypeName['BILL'];
}

export interface EditBillResponse {
  editBill: {
    bill: Bill;
    success: boolean;
  };
}
