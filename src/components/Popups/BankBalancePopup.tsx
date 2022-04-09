import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useEffect, useState } from 'react';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';

interface BankBalancePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
  changeBankBalance: (value: number | undefined) => void;
}

export const BankBalancePopup = ({ isOpen, close, changeBankBalance }: BankBalancePopupProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankBalance }: Account = account;
  const [value, setValue] = useState<number>(bankBalance);

  useEffect(() => {
    if (value !== bankBalance) {
      setValue(bankBalance);
    }
    // eslint-disable-next-line
  }, [bankBalance]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(parseFloat(event.target.value).toFixed(2)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      changeBankBalance(value);
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Bank Total</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter your updated bank total</DialogContentText>
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>
          }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          margin="dense"
          id="bank-total"
          type="number"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button onClick={() => changeBankBalance(value)} color="secondary" disabled={!value}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
