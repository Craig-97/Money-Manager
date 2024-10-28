import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormikErrors, FormikProps } from 'formik';
import { OneOffPayment, SetupFormValues } from '~/types';

interface PaymentsStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const PaymentsStep = ({ formik }: PaymentsStepProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } = formik;

  const onAdd = () => {
    if (values.oneOffPayments.length < 10) {
      setFieldValue('oneOffPayments', [...values.oneOffPayments, { name: '', amount: '' }]);
    }
  };

  const onRemove = (index: number) => {
    const newPayments = values.oneOffPayments.filter((_, i) => i !== index);
    setFieldValue('oneOffPayments', newPayments);

    if (touched.oneOffPayments) {
      const newTouched = [...touched.oneOffPayments];
      newTouched.splice(index, 1);
      formik.setTouched({ ...formik.touched, bills: newTouched });
    }

    if (errors.oneOffPayments) {
      const newErrors = [...(errors.bills as FormikErrors<OneOffPayment>[])];
      newErrors.splice(index, 1);
      formik.setErrors({ ...errors, bills: newErrors });
    }
  };

  const paymentErrors = errors.oneOffPayments as FormikErrors<OneOffPayment>[];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Add any upcoming one-time payments or expenses that aren't part of your regular monthly
        bills. This helps us track irregular expenses and maintain an accurate view of your
        available funds.
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        You can add up to 10 one-off payments to get started. Examples include annual subscriptions,
        planned purchases, or upcoming expenses.
      </Typography>

      {values.oneOffPayments.map((payment, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            name={`oneOffPayments.${index}.name`}
            label="Payment Name"
            value={payment.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.oneOffPayments?.[index]?.name && Boolean(paymentErrors?.[index]?.name)}
            helperText={touched.oneOffPayments?.[index]?.name && paymentErrors?.[index]?.name}
          />
          <TextField
            fullWidth
            name={`oneOffPayments.${index}.amount`}
            label="Amount"
            type="number"
            value={payment.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.oneOffPayments?.[index]?.amount && Boolean(paymentErrors?.[index]?.amount)
            }
            helperText={touched.oneOffPayments?.[index]?.amount && paymentErrors?.[index]?.amount}
          />
          <IconButton onClick={() => onRemove(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      {values.oneOffPayments.length < 10 && (
        <Button autoFocus variant="outlined" onClick={onAdd} fullWidth sx={{ mt: 1 }}>
          Add Payment
        </Button>
      )}
    </Box>
  );
};
