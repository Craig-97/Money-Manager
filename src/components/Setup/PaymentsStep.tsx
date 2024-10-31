import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormikErrors, FormikProps } from 'formik';
import { OneOffPayment, SetupFormValues } from '~/types';
import { handleAddArrayItem, handleRemoveArrayItem } from '~/utils';

interface PaymentsStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const PaymentsStep = ({ formik }: PaymentsStepProps) => {
  const { values, handleChange, handleBlur, touched, errors } = formik;

  const onAdd = () => {
    handleAddArrayItem<OneOffPayment>({
      formik,
      fieldName: 'oneOffPayments',
      newItem: { name: '', amount: 0 }
    });
  };

  const onRemove = (index: number) => {
    handleRemoveArrayItem<OneOffPayment>({
      formik,
      fieldName: 'oneOffPayments',
      index
    });
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
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">£</InputAdornment>
              }
            }}
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
