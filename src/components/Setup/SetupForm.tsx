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
import { useFormik } from 'formik';
import { useState } from 'react';
import { BasicInfoStep, BillsStep, PaydayStep, PaymentsStep, validationSchema } from '~/components';
import { useCreateAccount, useLogout } from '~/hooks';
import { useAccountContext } from '~/state';
import { PaydayType, PayFrequency, SetupFormValues } from '~/types';

const steps = ['Basic Info', 'Monthly Bills', 'Payments Due', 'Payday Setup'];

export const SetupForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    state: { user }
  } = useAccountContext();
  const [activeStep, setActiveStep] = useState(0);
  const logout = useLogout();
  const { createAccount, loading } = useCreateAccount();

  const formik = useFormik<SetupFormValues>({
    initialValues: {
      bankTotal: '',
      monthlyIncome: '',
      bills: [],
      oneOffPayments: [],
      paydayConfig: { type: PaydayType.LAST_DAY, frequency: PayFrequency.MONTHLY }
    },
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
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
            paydayConfig: values.paydayConfig,
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
      } else {
        const touchedFields = getTouchedFields(currentStepErrors);
        formik.setTouched(touchedFields, false);
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
        const { paydayConfig } = formik.values;
        const needsStartDate = paydayConfig.frequency !== PayFrequency.MONTHLY;
        const needsDayOfMonth = paydayConfig.type === PaydayType.SET_DAY;

        return (
          paydayConfig.type &&
          paydayConfig.frequency &&
          (!needsStartDate || (needsStartDate && paydayConfig.startDate)) &&
          (!needsDayOfMonth || (needsDayOfMonth && paydayConfig.dayOfMonth)) &&
          !formik.errors.paydayConfig
        );
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
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
        return errors.paydayConfig ? { paydayConfig: errors.paydayConfig } : {};
      default:
        return {};
    }
  };

  const getTouchedFields = (errors: any): Record<string, boolean> => {
    return Object.keys(errors).reduce((acc, key) => {
      if (typeof errors[key] === 'object' && errors[key] !== null) {
        return { ...acc, [key]: true, ...getTouchedFields(errors[key]) };
      }
      return { ...acc, [key]: true };
    }, {});
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
        {renderStepContent(activeStep)}

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
