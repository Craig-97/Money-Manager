import { FormikProps } from 'formik';
import { Bill } from './bill';
import { OneOffPayment } from './oneOffPayment';

export interface SetupFormValues {
  bankTotal: string;
  monthlyIncome: string;
  bills: Bill[];
  oneOffPayments: OneOffPayment[];
}

export interface StepProps {
  formik: FormikProps<SetupFormValues>;
}
