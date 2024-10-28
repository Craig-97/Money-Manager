import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormikErrors, FormikProps } from 'formik';
import { Bill, SetupFormValues } from '~/types';

interface BillsStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const BillsStep = ({ formik }: BillsStepProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } = formik;

  const onAdd = () => {
    if (values.bills.length < 10) {
      setFieldValue('bills', [...values.bills, { name: '', amount: '' }]);
    }
  };

  const onRemove = (index: number) => {
    const newBills = values.bills.filter((_, i) => i !== index);
    setFieldValue('bills', newBills);

    if (touched.bills) {
      const newTouched = [...touched.bills];
      newTouched.splice(index, 1);
      formik.setTouched({ ...formik.touched, bills: newTouched });
    }

    if (errors.bills) {
      const newErrors = [...(errors.bills as FormikErrors<Bill>[])];
      newErrors.splice(index, 1);
      formik.setErrors({ ...errors, bills: newErrors });
    }
  };

  const billErrors = errors.bills as FormikErrors<Bill>[];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Add your regular monthly bills such as rent/mortgage, utilities, subscriptions, and other
        fixed expenses. This helps us track your monthly commitments and calculate your disposable
        income.
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        You can add up to 10 bills to get started. For each bill, provide a descriptive name and the
        monthly amount.
      </Typography>

      {values.bills.map((bill, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            name={`bills.${index}.name`}
            label="Bill Name"
            value={bill.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.bills?.[index]?.name && Boolean(billErrors?.[index]?.name)}
            helperText={touched.bills?.[index]?.name && billErrors?.[index]?.name}
          />
          <TextField
            fullWidth
            name={`bills.${index}.amount`}
            label="Amount"
            type="number"
            value={bill.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.bills?.[index]?.amount && Boolean(billErrors?.[index]?.amount)}
            helperText={touched.bills?.[index]?.amount && billErrors?.[index]?.amount}
          />
          <IconButton onClick={() => onRemove(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      {values.bills.length < 10 && (
        <Button autoFocus variant="outlined" onClick={onAdd} fullWidth sx={{ mt: 1 }}>
          Add Bill
        </Button>
      )}
    </Box>
  );
};
