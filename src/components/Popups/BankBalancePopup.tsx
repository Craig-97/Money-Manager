import { useState, useEffect, ChangeEvent, KeyboardEvent, DispatchWithoutAction } from 'react';
import { useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import { useAccountContext } from '../../state/account-context';
import { EDIT_ACCOUNT_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Account } from '../../interfaces';

interface BankBalancePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const BankBalancePopup = ({ isOpen, close }: BankBalancePopupProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankBalance, id }: Account = account;
  const [value, setValue] = useState<number>();
  const [editAccount] = useMutation(EDIT_ACCOUNT_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  useEffect(() => {
    if (value !== bankBalance) {
      setValue(bankBalance);
    }
    // eslint-disable-next-line
  }, [bankBalance]);

  const changeBankBalance = () => {
    if (value && value !== bankBalance) {
      editAccount({
        variables: { id, account: { bankBalance: value } }
      });
    }
    close();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(parseFloat(event.target.value).toFixed(2)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      changeBankBalance();
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
        <Button onClick={changeBankBalance} color="secondary" disabled={!value}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
