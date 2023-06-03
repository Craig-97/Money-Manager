import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useEffect, useState } from 'react';
import { useAccountContext } from '~/state/account-context';
import { OneOffPayment } from '~/types';

interface PaymentsDuePopupProps {
  title: string;
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultName?: string;
  defaultAmount?: number | string;
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
    state: {
      account: { id }
    }
  } = useAccountContext();

  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<number | string>(defaultAmount);

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
    onSave({ name, amount: amount as number, account: id });
    handleClose();
  };

  const handleDeleteClicked = () => {
    onDelete && onDelete();
    close();
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(event.target.valueAsNumber)) {
      setAmount(event.target.valueAsNumber);
    } else {
      setAmount('');
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
    setAmount('');
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
          onChange={event => setName(event.target.value)}
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
