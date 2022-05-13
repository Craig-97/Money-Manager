import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import { Account, Bill } from '../../../../types';
import { useAccountContext } from '../../../../state/account-context';
import { getNumberAmount } from '../../../../utils';

interface MonthlyBillsPopupProps {
  title: string;
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultName?: string;
  defaultAmount?: string;
  defaultPaid?: boolean;
  onSave: ({ name, amount, paid, account }: Bill) => void;
  onDelete?: DispatchWithoutAction;
}

export const MonthlyBillsPopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = '',
  defaultPaid = false,
  onSave,
  onDelete
}: MonthlyBillsPopupProps) => {
  const {
    state: { account }
  } = useAccountContext();

  const { id }: Account = account;
  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<string>(defaultAmount);
  const [paid, setPaid] = useState<boolean>(defaultPaid);

  useEffect(() => {
    if (defaultName !== name) {
      setName(defaultName);
    }

    if (defaultAmount !== amount) {
      setAmount(defaultAmount);
    }

    if (defaultPaid !== paid) {
      setPaid(defaultPaid);
    }
    // eslint-disable-next-line
  }, [defaultName, defaultAmount, defaultPaid]);

  const handleSaveClicked = () => {
    onSave({ name, amount: getNumberAmount(amount), paid, account: id });
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

  const handlePaidChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPaid(event.target.checked);
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
    setPaid(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="monthly-bills-popup"
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
          id="bill-name"
          fullWidth
        />
        <DialogContentText>Amount</DialogContentText>
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>
          }}
          value={amount}
          onChange={handleAmountChange}
          onKeyDown={handleKeyDown}
          margin="dense"
          id="bill-amount"
          type="number"
          fullWidth
        />
        <DialogContentText>Paid</DialogContentText>
        <Checkbox
          checked={paid}
          onChange={handlePaidChange}
          inputProps={{ 'aria-label': 'controlled' }}
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