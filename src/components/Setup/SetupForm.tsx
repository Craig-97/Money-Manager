import { useMutation } from '@apollo/client';
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
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep, BillsStep, PaydayStep, PaymentsStep, validationSchema } from '~/components';
import { CREATE_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountContext } from '~/state';
import { PaydayType, PayFrequency, SetupFormValues } from '~/types';
import { useLogout } from '~/hooks';

const steps = ['Basic Info', 'Monthly Bills', 'Payments Due', 'Payday Setup'];

export const SetupForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    state: { user }
  } = useAccountContext();
  const handleGQLError = useErrorHandler();
  const [activeStep, setActiveStep] = useState(0);
  const logout = useLogout();

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT_MUTATION, {
    onError: handleGQLError,
    onCompleted: () => {
      enqueueSnackbar('Setup completed successfully!', { variant: 'success' });
      navigate('/');
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
      oneOffPayments: [],
      paydayConfig: { type: PaydayType.LAST_DAY, frequency: PayFrequency.MONTHLY }
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
            paydayConfig: values.paydayConfig,
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
      case 3:
        return formik.values.paydayConfig.type !== undefined;
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
