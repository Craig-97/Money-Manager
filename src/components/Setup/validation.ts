import * as Yup from 'yup';
import { PaydayType } from '~/types/payday';

export const validationSchema = Yup.object().shape({
  bankTotal: Yup.number().required('Bank total is required').min(0, 'Must be a positive number'),
  monthlyIncome: Yup.number()
    .required('Monthly income is required')
    .min(0, 'Must be a positive number'),
  bills: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        amount: Yup.number().required('Amount is required').min(0, 'Must be a positive number')
      })
    )
    .max(10, 'Maximum of 10 bills allowed'),
  oneOffPayments: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        amount: Yup.number().required('Amount is required').min(0, 'Must be a positive number')
      })
    )
    .max(10, 'Maximum of 10 payments allowed'),
  paydayConfig: Yup.object().shape({
    type: Yup.string()
      .oneOf(Object.values(PaydayType) as string[], 'Invalid payday type')
      .required('Payday type is required'),
    dayOfMonth: Yup.number().when('type', {
      is: (type: PaydayType) => type === PaydayType.SPECIFIC_DATE,
      then: schema =>
        schema
          .required('Day of month is required')
          .min(1, 'Must be between 1 and 31')
          .max(31, 'Must be between 1 and 31')
    }),
    weekday: Yup.number().when('type', {
      is: (type: PaydayType) =>
        [
          PaydayType.WEEKLY,
          PaydayType.BIWEEKLY,
          PaydayType.SPECIFIC_WEEKDAY,
          PaydayType.LAST_WEEKDAY
        ].includes(type),
      then: schema => schema.required('Day of week is required')
    }),
    startDate: Yup.string().when('type', {
      is: (type: PaydayType) => [PaydayType.WEEKLY, PaydayType.BIWEEKLY].includes(type),
      then: schema => schema.required('Start date is required')
    }),
    weekdayOccurrence: Yup.number().when('type', {
      is: (type: PaydayType) => type === PaydayType.SPECIFIC_WEEKDAY,
      then: schema =>
        schema
          .required('Week of month is required')
          .min(1, 'Must be between 1 and 4')
          .max(4, 'Must be between 1 and 4')
    })
  })
});
