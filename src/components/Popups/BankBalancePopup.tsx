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
  const [value, setValue] = useState<number>();

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
