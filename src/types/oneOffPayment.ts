import { TYPES } from '~/constants';

export interface OneOffPayment {
  id?: string;
  name?: string;
  amount?: number;
  account?: string;
  __typename?: TYPES.ONEOFFPAYMENT;
}

export interface DeletePaymentResponse {
  deleteOneOffPayment: {
    oneOffPayment: OneOffPayment;
    success: boolean;
  };
}
