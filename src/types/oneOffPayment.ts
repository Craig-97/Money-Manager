import { PAYMENT_TYPE } from '~/types';

export interface OneOffPayment {
  id?: string;
  name?: string;
  amount?: number;
  account?: string;
  __typename?: PAYMENT_TYPE['ONEOFFPAYMENT'];
}

export interface DeletePaymentResponse {
  deleteOneOffPayment: {
    oneOffPayment: OneOffPayment;
    success: boolean;
  };
}
