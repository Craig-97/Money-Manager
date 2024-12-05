import { useState, useEffect, Fragment } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import PaidIcon from '@mui/icons-material/Paid';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LoadingIconButton } from '~/components/LoadingIconButton';
import { PAYMENT_CATEGORY } from '~/constants';
import { PAYMENT_TYPE } from '~/constants';
import { useAccountStore } from '~/state';
import { OneOffPayment } from '~/types';
import { getOneOffCategoryOptions, getNextWeekDate, getInputDateFromTimestamp } from '~/utils';

interface PaymentsDuePopupProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  defaultValues?: Partial<OneOffPayment>;
  onSave: (payment: OneOffPayment) => void;
  onDelete?: (paid: boolean) => void;
  loading?: boolean;
}

type LoadingAction = 'save' | 'pay' | 'delete' | null;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  amount: Yup.number().required('Amount is required'),
  dueDate: Yup.string().required('Due date is required'),
  type: Yup.string().required('Type is required'),
  category: Yup.string().required('Category is required')
});

export const PaymentsDuePopup = ({
  title,
  isOpen,
  close,
  defaultValues = {},
  onSave,
  onDelete,
  loading = false
}: PaymentsDuePopupProps) => {
  const id = useAccountStore(s => s.account.id);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const formik = useFormik({
    initialValues: {
      name: defaultValues.name ?? '',
      amount: defaultValues.amount ?? 0,
      dueDate: defaultValues.dueDate
        ? getInputDateFromTimestamp(defaultValues.dueDate)
        : getNextWeekDate(),
      type: defaultValues.type ?? PAYMENT_TYPE.EXPENSE,
      category: defaultValues.category ?? PAYMENT_CATEGORY.OTHER
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: values => {
      setLoadingAction('save');
      onSave({ ...values, account: id });
    }
  });

  const handleButtonClicked = (paid: boolean) => {
    if (onDelete) {
      setLoadingAction(paid ? 'pay' : 'delete');
      onDelete(paid);
    }
  };

  const handleClose = () => {
    close();
    formik.resetForm();
  };

  useEffect(() => {
    if (!loading) {
      setLoadingAction(null);

      // Reset form values after save
      if (loadingAction === 'save') {
        formik.resetForm();
      }
    }
  }, [loading, loadingAction]);

  return (
    <Dialog
      disableRestoreFocus
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="payments-due-popup"
      maxWidth="sm"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        <Box>
          {onDelete && (
            <Fragment>
              <LoadingIconButton
                tooltip="Pay"
                onClick={() => handleButtonClicked(true)}
                disabled={loading || !formik.isValid}
                loading={loading && loadingAction === 'pay'}
                icon={<PaidIcon />}
              />
              <LoadingIconButton
                tooltip="Delete"
                onClick={() => handleButtonClicked(false)}
                disabled={loading || !formik.isValid}
                loading={loading && loadingAction === 'delete'}
                icon={<DeleteIcon />}
              />
            </Fragment>
          )}
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} columns={{ mobile: 1, sm: 2 }}>
            <Grid size={{ mobile: 1, sm: 2 }}>
              <TextField
                {...formik.getFieldProps('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={loading}
                autoFocus
                margin="dense"
                label="Name"
                id="payment-name"
                fullWidth
              />
            </Grid>

            <Grid size={1}>
              <TextField
                {...formik.getFieldProps('amount')}
                type="number"
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>
                  }
                }}
                disabled={loading}
                margin="dense"
                label="Amount"
                id="payment-amount"
                fullWidth
              />
            </Grid>

            <Grid size={1}>
              <TextField
                {...formik.getFieldProps('dueDate')}
                type="date"
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
                disabled={loading}
                margin="dense"
                label="Due Date"
                id="payment-due-date"
                fullWidth
                sx={{
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)'
                  }
                }}
              />
            </Grid>

            <Grid size={1}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="payment-type-label">Type</InputLabel>
                <Select
                  {...formik.getFieldProps('type')}
                  labelId="payment-type-label"
                  id="payment-type"
                  label="Type"
                  disabled={loading}>
                  {Object.entries(PAYMENT_TYPE).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={1}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="payment-category-label">Category</InputLabel>
                <Select
                  {...formik.getFieldProps('category')}
                  labelId="payment-category-label"
                  id="payment-category"
                  label="Category"
                  disabled={loading}>
                  {getOneOffCategoryOptions().map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} color="secondary" variant="outlined">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={loading && loadingAction === 'save'}
            disabled={loading || !formik.isValid}
            variant="contained">
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
