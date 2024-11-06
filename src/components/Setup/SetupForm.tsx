import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Button,
  CircularProgress,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { FormikProps, useFormik } from 'formik';
import { useState } from 'react';
import { BasicInfoStep, BillsStep, PaydayStep, PaymentsStep, validationSchema } from '~/components';
import { BANK_HOLIDAY_REGION, PAY_FREQUENCY, PAYDAY_TYPE } from '~/constants';
import { useCreateAccount, useLogout } from '~/hooks';
import { useAccountContext } from '~/state';
import { SetupFormValues } from '~/types';
import * as Yup from 'yup';

const steps = ['Basic Info', 'Monthly Bills', 'Payments Due', 'Payday Setup'];

const getStepErrors = (errors: any, step: number) => {
  switch (step) {
    case 0:
      return {
        ...(errors.bankTotal && { bankTotal: errors.bankTotal }),
        ...(errors.monthlyIncome && { monthlyIncome: errors.monthlyIncome })
      };
    case 1:
      return errors.bills ? { bills: errors.bills } : {};
    case 2:
      return errors.oneOffPayments ? { oneOffPayments: errors.oneOffPayments } : {};
    case 3:
      return errors.payday ? { payday: errors.payday } : {};
    default:
      return {};
  }
};

const renderStepContent = (step: number, formik: FormikProps<SetupFormValues>) => {
  switch (step) {
    case 0:
      return <BasicInfoStep formik={formik} />;
    case 1:
      return <BillsStep formik={formik} />;
    case 2:
      return <PaymentsStep formik={formik} />;
    case 3:
      return <PaydayStep formik={formik} />;
    default:
      return null;
  }
};

export const SetupForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAccountContext();
  const [activeStep, setActiveStep] = useState(0);
  const logout = useLogout();
  const { createAccount, loading } = useCreateAccount();

  const formik = useFormik<SetupFormValues>({
    initialValues: {
      bankTotal: '',
      monthlyIncome: '',
      bills: [],
      oneOffPayments: [],
      payday: {
        type: PAYDAY_TYPE.LAST_DAY,
        frequency: PAY_FREQUENCY.MONTHLY,
        bankHolidayRegion: BANK_HOLIDAY_REGION.SCOTLAND
      }
    },
    validationSchema,
    validate: values => {
      try {
        validationSchema.validateSync(values, {
          context: {
            bills: values.bills,
            oneOffPayments: values.oneOffPayments
          }
        });
        return {}; // Return empty object if validation passes
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors: Record<string, string> = {};
          err.inner.forEach(error => {
            if (error.path) {
              errors[error.path] = error.message;
            }
          });
          return errors;
        }
        return {}; // Return empty object for unexpected errors
      }
    },
    onSubmit: async values => {
      if (activeStep !== steps.length - 1) {
        return;
      }
      await createAccount({
        variables: {
          account: {
            bankBalance: parseFloat(values.bankTotal),
            monthlyIncome: parseFloat(values.monthlyIncome),
            bills: values.bills,
            oneOffPayments: values.oneOffPayments,
            payday: values.payday,
            userId: user.id
          }
        }
      });
    }
  });

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    formik.validateForm().then(errors => {
      const currentStepErrors = getStepErrors(errors, activeStep);
      if (Object.keys(currentStepErrors).length === 0) {
        setActiveStep(prevStep => prevStep + 1);
      }
    });
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep(prevStep => prevStep - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formik.values.bankTotal &&
          formik.values.monthlyIncome &&
          !formik.errors.bankTotal &&
          !formik.errors.monthlyIncome
        );
      case 1:
        return (
          (formik.values.bills.length === 0 ||
            formik.values.bills.every(bill => bill.name && bill.amount)) &&
          !formik.errors.bills
        );
      case 2:
        return (
          (formik.values.oneOffPayments.length === 0 ||
            formik.values.oneOffPayments.every(payment => payment.name && payment.amount)) &&
          !formik.errors.oneOffPayments
        );
      case 3:
        const { payday } = formik.values;
        const needsStartDate = payday.frequency !== PAY_FREQUENCY.MONTHLY;
        const needsDayOfMonth = payday.type === PAYDAY_TYPE.SET_DAY;

        return (
          payday.type &&
          payday.frequency &&
          (!needsStartDate || (needsStartDate && payday.firstPayDate)) &&
          (!needsDayOfMonth || (needsDayOfMonth && payday.dayOfMonth)) &&
          !formik.errors.payday
        );
      default:
        return false;
    }
  };

  return (
    <>
      {isMobile ? (
        <MobileStepper
          variant="text"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          sx={{ background: 'transparent', mb: 4 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1 || !isStepValid()}
              tabIndex={0}>
              Next
              <ArrowForwardIcon />
            </Button>
          }
          backButton={
            activeStep !== 0 ? (
              <Button size="small" onClick={handleBack} disabled={activeStep === 0} tabIndex={1}>
                <ArrowBackIcon />
                Back
              </Button>
            ) : (
              <Button
                size="small"
                onClick={() => logout()}
                startIcon={<ArrowBackIcon />}
                tabIndex={1}>
                Logout
              </Button>
            )
          }
        />
      ) : (
        <Stepper activeStep={activeStep} sx={{ my: 4 }} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <form onSubmit={formik.handleSubmit}>
        {renderStepContent(activeStep, formik)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {!isMobile &&
            (activeStep === 0 ? (
              <Button onClick={() => logout()} startIcon={<ArrowBackIcon />} tabIndex={1}>
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
                tabIndex={1}>
                Back
              </Button>
            ))}

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              type="submit"
              disabled={loading || !isStepValid()}
              endIcon={loading ? <CircularProgress size={20} /> : null}
              tabIndex={0}>
              Complete Setup
            </Button>
          ) : (
            !isMobile && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
                endIcon={<ArrowForwardIcon />}
                tabIndex={0}>
                Next
              </Button>
            )
          )}
        </Box>
      </form>
    </>
  );
};
