import { FormikProps } from 'formik';
import { Bill } from './bill';
import { OneOffPayment } from './oneOffPayment';
import { Payday } from './payday';

export interface SetupFormValues {
  bankBalance: string;
  monthlyIncome: string;
  bills: Bill[];
  oneOffPayments: OneOffPayment[];
  payday: Payday;
}

export interface StepProps {
  formik: FormikProps<SetupFormValues>;
}
