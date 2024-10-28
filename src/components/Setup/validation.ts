import * as Yup from 'yup';
import { PaydayType, PayFrequency } from '~/types/payday';

export const validationSchema = Yup.object().shape({
  bankTotal: Yup.number()
    .required('Bank total is required')
    .min(0, 'Must be a positive number')
    .typeError('Bank total must be a number'),
  monthlyIncome: Yup.number()
    .required('Monthly income is required')
    .min(0, 'Must be a positive number')
    .typeError('Monthly income must be a number'),
  bills: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Must be a positive number')
          .typeError('Amount must be a number')
      })
    )
    .max(10, 'Maximum of 10 bills allowed'),
  oneOffPayments: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Must be a positive number')
          .typeError('Amount must be a number')
      })
    )
    .max(10, 'Maximum of 10 payments allowed'),
  paydayConfig: Yup.object().shape({
    frequency: Yup.string()
      .oneOf(Object.values(PayFrequency), 'Invalid pay frequency')
      .required('Pay frequency is required'),
    type: Yup.string()
      .oneOf(Object.values(PaydayType), 'Invalid payday type')
      .required('Payday type is required'),
    dayOfMonth: Yup.number().when('type', {
      is: PaydayType.SET_DAY,
      then: schema =>
        schema
          .required('Day of month is required')
          .min(1, 'Must be between 1 and 31')
          .max(31, 'Must be between 1 and 31')
          .typeError('Day of month must be a number'),
      otherwise: schema => schema.nullable()
    }),
    startDate: Yup.string().when('frequency', {
      is: (frequency: PayFrequency) => frequency !== PayFrequency.MONTHLY,
      then: schema => schema.required('First pay date is required'),
      otherwise: schema => schema.nullable()
    })
  })
});
