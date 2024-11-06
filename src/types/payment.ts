import { PAYMENT_TYPES } from '~/constants';

export type PaymentType = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];
export type PAYMENT_TYPE = typeof PAYMENT_TYPES;
