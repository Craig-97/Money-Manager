import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useEffect, useState } from 'react';
import { Account, OneOffPayment } from '../../../../types';
import { useAccountContext } from '../../../../state/account-context';
import { getNumberAmount } from '../../../../utils';

interface PaymentsDuePopupProps {
  title: string;
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultName?: string;
  defaultAmount?: string;
  onSave: ({ name, amount, account }: OneOffPayment) => void;
  onDelete?: DispatchWithoutAction;
}

export const PaymentsDuePopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = '',
  onSave,
  onDelete
}: PaymentsDuePopupProps) => {
  const {
    state: { account }
  } = useAccountContext();

  const { id }: Account = account;
  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<string>(defaultAmount);

  useEffect(() => {
    if (defaultName !== name) {
      setName(defaultName);
    }

    if (defaultAmount !== amount) {
      setAmount(defaultAmount);
    }

    // eslint-disable-next-line
  }, [defaultName, defaultAmount]);

  const handleSaveClicked = () => {
    onSave({ name, amount: getNumberAmount(amount), account: id });
    handleClose();
  };

  const handleDeleteClicked = () => {
    onDelete && onDelete();
    close();
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const number = getNumberAmount(event.target.value);
    if (isNaN(number)) {
      setAmount('');
    } else {
      setAmount(number.toString());
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && name && amount) {
      event.preventDefault();
      handleSaveClicked();
    }
  };

  const handleClose = () => {
    close();
    setAmount(defaultAmount);
    setName('');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="payments-due-popup"
      maxWidth={'xs'}
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        {onDelete && (
          <IconButton onClick={handleDeleteClicked} disabled={!name || !amount}>
            <DeleteIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>Name</DialogContentText>
        <TextField
          value={name}
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          autoFocus
          margin="dense"
          id="payment-name"
          fullWidth
        />
        <DialogContentText>Amount</DialogContentText>
        <TextField
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>
          }}
          value={amount}
          onChange={handleAmountChange}
          onKeyDown={handleKeyDown}
          margin="dense"
          id="payment-amount"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSaveClicked} color="secondary" disabled={!name || !amount}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
