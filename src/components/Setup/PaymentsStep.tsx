import { Box, TextField, IconButton, Button } from '@mui/material';
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
  };

  const paymentErrors = errors.bills as FormikErrors<OneOffPayment>[];

  return (
    <Box sx={{ mt: 2 }}>
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
