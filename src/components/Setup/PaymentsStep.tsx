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
    if (touched.oneOffPayments && touched.oneOffPayments.length) {
      const newTouched = [...touched.oneOffPayments];
      newTouched.splice(index, 1);
      const updatedTouched = { ...touched, oneOffPayments: newTouched };
      formik.setTouched(updatedTouched);
    }

    if (errors.oneOffPayments && errors.oneOffPayments.length) {
      const newErrors = [...(errors.oneOffPayments as FormikErrors<OneOffPayment>[])];
      newErrors.splice(index, 1);
      const updatedErrors = { ...errors, oneOffPayments: newErrors };
      formik.setErrors(updatedErrors);
    }

    const newPayments = values.oneOffPayments.filter((_, i) => i !== index);
    setFieldValue('oneOffPayments', newPayments);
  };

  const paymentErrors = errors.oneOffPayments as FormikErrors<OneOffPayment>[];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Add any upcoming one-time payments such as planned purchases, or upcoming expenses. This
        helps us track irregular expenses and maintain an accurate view of your available funds.
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        You can add up to 10 one-off payments to get started. For each payment, provide a
        descriptive name and the amount.
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
