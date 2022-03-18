import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useEffect, useState } from 'react';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
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
  const [value, setValue] = useState<number>();

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
