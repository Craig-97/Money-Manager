import { PaymentTypeName } from './payment';
import { PAYMENT_CATEGORY, PAYMENT_TYPE } from '~/constants';

export type PaymentCategory = (typeof PAYMENT_CATEGORY)[keyof typeof PAYMENT_CATEGORY];
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export interface OneOffPayment {
  id?: string;
  name?: string;
  amount?: number;
  account?: string;
  dueDate?: string;
  type?: PaymentType;
  category?: PaymentCategory;
  __typename?: PaymentTypeName['ONEOFFPAYMENT'];
}

export interface DeletePaymentResponse {
  deleteOneOffPayment: {
    oneOffPayment: OneOffPayment;
    success: boolean;
  };
}
