import React, { useState, useEffect } from 'react';
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
import { UPDATE_ACCOUNT_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';

export const BankBalancePopup = ({ open, setOpen }) => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankBalance, id } = account;
  const [value, setValue] = useState('');
  const [updateAccount] = useMutation(UPDATE_ACCOUNT_MUTATION, {
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
      updateAccount({
        variables: { id, account: { bankBalance: parseFloat(value) } }
      });
    }
    handleClose();
  };

  const handleChange = event => {
    setValue(event.target.value);
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      changeBankBalance();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={changeBankBalance} color="secondary" disabled={!value}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
