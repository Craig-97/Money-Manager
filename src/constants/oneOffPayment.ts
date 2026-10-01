import { PaymentCategory, PaymentType } from '~/types';

// `satisfies` keeps these in step with the API's enums, so a value the API rejects won't compile
export const PAYMENT_CATEGORY = {
  TRANSFER: 'TRANSFER',
  INVESTMENT: 'INVESTMENT',
  FEES: 'FEES',
  TAXES: 'TAXES',
  HOME: 'HOME',
  UTILITIES: 'UTILITIES',
  VEHICLE: 'VEHICLE',
  TRAVEL: 'TRAVEL',
  TRANSPORT: 'TRANSPORT',
  FOOD: 'FOOD',
  SHOPPING: 'SHOPPING',
  ENTERTAINMENT: 'ENTERTAINMENT',
  HEALTHCARE: 'HEALTHCARE',
  EDUCATION: 'EDUCATION',
  GIFT: 'GIFT',
  PETS: 'PETS',
  SALARY: 'SALARY',
  BUSINESS: 'BUSINESS',
  CHARITY: 'CHARITY',
  OTHER: 'OTHER'
} as const satisfies { [K in PaymentCategory]: K };

export const PAYMENT_TYPE = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const satisfies { [K in PaymentType]: K };
