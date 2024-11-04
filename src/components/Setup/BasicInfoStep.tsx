import { FormikProps } from 'formik';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { SetupFormValues } from '~/types';

interface BasicInfoStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const BasicInfoStep = ({ formik }: BasicInfoStepProps) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="body1" sx={{ mb: 3 }}>
      Let's start by setting up your basic financial information. This will help us calculate your
      disposable income and track your finances effectively.
    </Typography>

    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Enter the total available funds in your bank account.
      </Typography>
      <TextField
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">£</InputAdornment>
          }
        }}
        autoFocus
        fullWidth
        id="bankTotal"
        name="bankTotal"
        label="Bank Total"
        type="number"
        value={formik.values.bankTotal}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.bankTotal && Boolean(formik.errors.bankTotal)}
        helperText={formik.touched.bankTotal && formik.errors.bankTotal}
        margin="normal"
      />
    </Box>

    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
      Enter your monthly income after tax and deductions.
    </Typography>
    <TextField
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">£</InputAdornment>
        }
      }}
      fullWidth
      id="monthlyIncome"
      name="monthlyIncome"
      label="Monthly Income"
      type="number"
      value={formik.values.monthlyIncome}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.monthlyIncome && Boolean(formik.errors.monthlyIncome)}
      helperText={formik.touched.monthlyIncome && formik.errors.monthlyIncome}
      margin="normal"
    />
  </Box>
);
