import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Bill } from '~/types';
import { useAccountContext } from '~/state';

interface AddEditBillModalProps {
  open: boolean;
  onClose: () => void;
  bill?: Bill;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
  category: Yup.string().required('Category is required'),
  dueDate: Yup.number()
    .required('Due date is required')
    .min(1, 'Must be between 1-31')
    .max(31, 'Must be between 1-31'),
  frequency: Yup.string().required('Frequency is required')
});

export const AddEditBillModal = ({ open, onClose, bill }: AddEditBillModalProps) => {
  const { account } = useAccountContext();

  const formik = useFormik({
    initialValues: {
      name: bill?.name || '',
      amount: bill?.amount || '',
      category: 'utilities',
      dueDate: 1,
      frequency: 'monthly'
    },
    validationSchema,
    onSubmit: values => {
      // Handle submit
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{bill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Bill Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="dueDate"
                label="Due Date"
                type="number"
                value={formik.values.dueDate}
                onChange={formik.handleChange}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  label="Category">
                  <MenuItem value="utilities">Utilities</MenuItem>
                  <MenuItem value="rent">Rent/Mortgage</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="subscriptions">Subscriptions</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={formik.values.frequency}
                  onChange={formik.handleChange}
                  label="Frequency">
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {bill ? 'Save Changes' : 'Add Bill'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
