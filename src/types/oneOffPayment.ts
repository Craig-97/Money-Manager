import { PaymentTypeName } from './payment';
import { OneOffPaymentCategory as PaymentCategory, PaymentType } from '~/graphql/generated';

// The API's enums are the source of truth for these
export type { PaymentCategory, PaymentType };

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
