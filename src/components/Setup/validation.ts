import * as Yup from 'yup';
import { PAY_FREQUENCY, PAYDAY_TYPE, WEEKDAY } from '~/constants';
import { PayFrequency } from '~/types';

const uniqueNameValidator = (items: { name: string }[], name: string, path: string) => {
  if (!name) return true; // Empty names are handled by required validation

  // Extract the current index from the path (e.g., "bills[0].name" -> 0)
  const currentIndex = parseInt(path.match(/\[(\d+)\]/)?.[1] ?? '-1');

  return !items.some(
    (item, index) =>
      item.name && name && item.name.toLowerCase() === name.toLowerCase() && index !== currentIndex
  );
};

export const validationSchema = Yup.object().shape({
  bankBalance: Yup.number()
    .typeError('Bank balance must be a number')
    .required('Bank balance is required')
    .moreThan(0, 'Must be greater than 0'),
  monthlyIncome: Yup.number()
    .typeError('Monthly income must be a number')
    .required('Monthly income is required')
    .moreThan(0, 'Must be greater than 0'),
  bills: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required('Name is required')
          .test('unique-bill-name', 'Bill name must be unique', function (value) {
            const { path } = this;
            const { bills, oneOffPayments } = this.options.context as {
              bills: { name: string }[];
              oneOffPayments: { name: string }[];
            };

            // Check uniqueness within bills
            const uniqueInBills = uniqueNameValidator(bills, value, path);
            // Check uniqueness against payments
            const uniqueAgainstPayments = !oneOffPayments?.some(
              (payment: { name: string }) => payment.name?.toLowerCase() === value?.toLowerCase()
            );

            return uniqueInBills && uniqueAgainstPayments;
          }),
        amount: Yup.number()
          .required('Amount is required')
          .typeError('Amount must be a number')
          .moreThan(0, 'Must be greater than 0')
      })
    )
    .max(10, 'Maximum of 10 bills allowed'),
  oneOffPayments: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required('Name is required')
          .test('unique-payment-name', 'Payment name must be unique', function (value) {
            const { path } = this;
            const { bills, oneOffPayments } = this.options.context as {
              bills: { name: string }[];
              oneOffPayments: { name: string }[];
            };

            // Check uniqueness within payments
            const uniqueInPayments = uniqueNameValidator(oneOffPayments, value, path);
            // Check uniqueness against bills
            const uniqueAgainstBills = !bills?.some(
              (bill: { name: string }) => bill.name?.toLowerCase() === value?.toLowerCase()
            );

            return uniqueInPayments && uniqueAgainstBills;
          }),
        amount: Yup.number()
          .required('Amount is required')
          .typeError('Amount must be a number')
          .moreThan(0, 'Must be greater than 0')
      })
    )
    .max(10, 'Maximum of 10 payments allowed'),
  payday: Yup.object().shape({
    frequency: Yup.string()
      .oneOf(Object.values(PAY_FREQUENCY), 'Invalid pay frequency')
      .required('Pay frequency is required'),
    type: Yup.string()
      .oneOf(Object.values(PAYDAY_TYPE), 'Invalid payday type')
      .required('Payday type is required'),
    dayOfMonth: Yup.number().when('type', {
      is: PAYDAY_TYPE.SET_DAY,
      then: schema =>
        schema
          .required('Day of month is required')
          .min(1, 'Must be between 1 and 31')
          .max(31, 'Must be between 1 and 31')
          .typeError('Day of month must be a number'),
      otherwise: schema => schema.nullable()
    }),
    weekday: Yup.string().when('type', {
      is: PAYDAY_TYPE.SET_WEEKDAY,
      then: schema =>
        schema
          .required('Day of week is required')
          .oneOf(Object.values(WEEKDAY), 'Invalid day of week'),
      otherwise: schema => schema.nullable()
    }),
    firstPayDate: Yup.string().when('frequency', {
      is: (frequency: PayFrequency) => frequency !== PAY_FREQUENCY.MONTHLY,
      then: schema => schema.required('First pay date is required'),
      otherwise: schema => schema.nullable()
    })
  })
});
