import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useEffect, useState } from 'react';
import { Account } from '../../../types';
import { useAccountContext } from '../../../state/account-context';
interface MonthlyIncomePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
  changeMonthlyIncome: (value: number | undefined) => void;
}

export const MonthlyIncomePopup = ({
  isOpen,
  close,
  changeMonthlyIncome
}: MonthlyIncomePopupProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { monthlyIncome }: Account = account;
  const [value, setValue] = useState<number>(monthlyIncome);

  useEffect(() => {
    if (value !== monthlyIncome) {
      setValue(monthlyIncome);
    }
    // eslint-disable-next-line
  }, [monthlyIncome]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(parseFloat(event.target.value).toFixed(2)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      changeMonthlyIncome(value);
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Monthly Income</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter your updated monthly income</DialogContentText>
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>
          }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          margin="dense"
          id="monthly-income"
          type="number"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button onClick={() => changeMonthlyIncome(value)} color="secondary" disabled={!value}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
