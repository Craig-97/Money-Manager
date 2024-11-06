import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, DispatchWithoutAction, KeyboardEvent, useState } from 'react';
import { useAccountContext } from '~/state/account-context';
import { Bill } from '~/types';
import { Tooltip } from '@mui/material';
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

interface MonthlyBillsPopupProps {
  title: string;
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultName?: string;
  defaultAmount?: number;
  defaultPaid?: boolean;
  onSave: ({ name, amount, paid, account }: Bill) => void;
  onDelete?: DispatchWithoutAction;
}

export const MonthlyBillsPopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = 0,
  defaultPaid = false,
  onSave,
  onDelete
}: MonthlyBillsPopupProps) => {
  const { account } = useAccountContext();
  const { id } = account;

  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paid, setPaid] = useState<boolean>(defaultPaid);

  const handleSaveClicked = () => {
    onSave({ name, amount, paid, account: id });
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
      setAmount(0);
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
    setAmount(0);
    setName('');
    setPaid(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="monthly-bills-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton onClick={handleDeleteClicked} disabled={!name || (!amount && amount !== 0)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
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
          id="bill-name"
          fullWidth
        />
        <DialogContentText>Amount</DialogContentText>
        <TextField
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>
            }
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
          onChange={event => setPaid(event.target.checked)}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSaveClicked}
          color="secondary"
          disabled={!name || (!amount && amount !== 0)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
