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

export const MonthlyIncomePopup = ({ open, setOpen }) => {
  const {
    state: { account }
  } = useAccountContext();
  const { monthlyIncome, id } = account;
  const [value, setValue] = useState('');
  const [updateAccount] = useMutation(UPDATE_ACCOUNT_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  useEffect(() => {
    if (value !== monthlyIncome) {
      setValue(monthlyIncome);
    }
    // eslint-disable-next-line
  }, [monthlyIncome]);

  const changeMonthlyIncome = () => {
    if (value && value !== monthlyIncome) {
      updateAccount({
        variables: { id, account: { monthlyIncome: parseFloat(value) } }
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
      changeMonthlyIncome();
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={changeMonthlyIncome}
          color="secondary"
          disabled={!value}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
