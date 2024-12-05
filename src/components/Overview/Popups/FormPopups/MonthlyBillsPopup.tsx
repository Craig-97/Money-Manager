import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  FormControlLabel
} from '@mui/material';
import { LoadingIconButton } from '~/components/LoadingIconButton';
import { useAccountStore } from '~/state';
import { Bill } from '~/types';

interface MonthlyBillsPopupProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  defaultValues?: Partial<Bill>;
  onSave: (bill: Bill) => void;
  onDelete?: () => void;
  loading?: boolean;
}

type LoadingAction = 'save' | 'delete' | null;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  amount: Yup.number().required('Amount is required'),
  paid: Yup.boolean()
});

export const MonthlyBillsPopup = ({
  title,
  isOpen,
  close,
  defaultValues = {},
  onSave,
  onDelete,
  loading = false
}: MonthlyBillsPopupProps) => {
  const id = useAccountStore(s => s.account.id);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const formik = useFormik({
    initialValues: {
      name: defaultValues.name ?? '',
      amount: defaultValues.amount ?? 0,
      paid: defaultValues.paid ?? false
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: values => {
      setLoadingAction('save');
      onSave({ ...values, account: id });
    }
  });

  const handleDeleteClicked = () => {
    if (onDelete) {
      setLoadingAction('delete');
      onDelete();
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
      className="monthly-bills-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        {onDelete && (
          <LoadingIconButton
            tooltip="Delete"
            onClick={handleDeleteClicked}
            disabled={loading || !formik.isValid}
            loading={loading && loadingAction === 'delete'}
            icon={<DeleteIcon />}
          />
        )}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            {...formik.getFieldProps('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            disabled={loading}
            autoFocus
            margin="dense"
            label="Name"
            id="bill-name"
            fullWidth
          />
          <TextField
            {...formik.getFieldProps('amount')}
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
            id="bill-amount"
            type="number"
            fullWidth
          />
          <FormControlLabel
            label="Paid"
            control={<Checkbox {...formik.getFieldProps('paid')} checked={formik.values.paid} />}
            sx={{
              display: 'flex',
              flexDirection: 'column-reverse',
              alignItems: 'flex-start',
              m: 0
            }}
          />
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
