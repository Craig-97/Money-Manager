import { PAYMENT_TYPES } from './payment';

export interface OneOffPayment {
  id?: string;
  name?: string;
  amount?: number;
  account?: string;
  __typename?: PAYMENT_TYPES.ONEOFFPAYMENT;
}

export interface DeletePaymentResponse {
  deleteOneOffPayment: {
    oneOffPayment: OneOffPayment;
    success: boolean;
  };
}
