import { Box, TextField, IconButton, Button } from '@mui/material';
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
  };

  const billErrors = errors.bills as FormikErrors<Bill>[];

  return (
    <Box sx={{ mt: 2 }}>
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
            error={
              touched.bills?.[index]?.amount && Boolean((errors.bills?.[index] as Bill)?.amount)
            }
            helperText={touched.bills?.[index]?.amount && billErrors?.[index]?.amount}
          />
          <IconButton onClick={() => onRemove(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      {values.bills.length < 10 && (
        <Button variant="outlined" onClick={onAdd} fullWidth sx={{ mt: 1 }}>
          Add Bill
        </Button>
      )}
    </Box>
  );
};
