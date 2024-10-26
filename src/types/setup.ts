import { FormikProps } from 'formik';
import { Bill } from './bill';
import { OneOffPayment } from './oneOffPayment';
import { PaydayConfig } from './payday';

export interface SetupFormValues {
  bankTotal: string;
  monthlyIncome: string;
  bills: Bill[];
  oneOffPayments: OneOffPayment[];
  paydayConfig: PaydayConfig;
}

export interface StepProps {
  formik: FormikProps<SetupFormValues>;
}
