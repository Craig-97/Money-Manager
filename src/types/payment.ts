import { PAYMENT_TYPENAME } from '~/constants';

export type PaymentType = (typeof PAYMENT_TYPENAME)[keyof typeof PAYMENT_TYPENAME];
export type PaymentTypeName = typeof PAYMENT_TYPENAME;
