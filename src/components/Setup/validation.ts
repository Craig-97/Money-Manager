import * as Yup from 'yup';

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
    .max(10, 'Maximum of 10 payments allowed')
});
