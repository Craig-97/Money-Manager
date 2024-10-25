import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAccountContext } from '~/state';
import { CREATE_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useFormik } from 'formik';
import { Button, Box, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useErrorHandler } from '~/hooks';
import { BasicInfoStep, BillsStep, PaymentsStep, validationSchema } from '~/components';
import { SetupFormValues } from '~/types';
import { useNavigate } from 'react-router-dom';

const steps = ['Basic Info', 'Monthly Bills', 'One-Off Payments'];

export const SetupForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    state: { user }
  } = useAccountContext();
  const handleGQLError = useErrorHandler();
  const [activeStep, setActiveStep] = useState(0);

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT_MUTATION, {
    onError: handleGQLError,
    onCompleted: () => {
      enqueueSnackbar('Setup completed successfully!', { variant: 'success' });
      navigate('/'); // TODO - Investigate why it's not navigating to dashboard on success
    },
    update: (
      cache,
      {
        data: {
          createAccount: { account }
        }
      }
    ) => {
      editAccountCache(cache, account, user);
    }
  });

  const formik = useFormik<SetupFormValues>({
    initialValues: {
      bankTotal: '',
      monthlyIncome: '',
      bills: [],
      oneOffPayments: []
    },
    validationSchema,
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
            userId: user.id
          }
        }
      });
    }
  });

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep(prevStep => prevStep - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formik.values.bankTotal && formik.values.monthlyIncome;
      case 1:
        return formik.values.bills.every(bill => bill.name && bill.amount);
      case 2:
        return formik.values.oneOffPayments.every(payment => payment.name && payment.amount);
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
      default:
        return null;
    }
  };

  return (
    <>
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={formik.handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleBack} disabled={activeStep === 0} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              type="submit"
              disabled={loading || !isStepValid()}
              endIcon={loading ? <CircularProgress size={20} /> : null}>
              Complete Setup
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
              endIcon={<ArrowForwardIcon />}>
              Next
            </Button>
          )}
        </Box>
      </form>
    </>
  );
};

export default SetupForm;
