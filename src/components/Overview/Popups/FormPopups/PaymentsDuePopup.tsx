import DeleteIcon from '@mui/icons-material/Delete';
import PaidIcon from '@mui/icons-material/Paid';
import { Box, Tooltip } from '@mui/material';
import { ChangeEvent, DispatchWithoutAction, Fragment, KeyboardEvent, useState } from 'react';
import { useAccountContext } from '~/state/account-context';
import { OneOffPayment } from '~/types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface PaymentsDuePopupProps {
  title: string;
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultName?: string;
  defaultAmount?: number;
  onSave: ({ name, amount, account }: OneOffPayment) => void;
  onDelete?: (paid: boolean) => void;
}

export const PaymentsDuePopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = 0,
  onSave,
  onDelete
}: PaymentsDuePopupProps) => {
  const { account } = useAccountContext();
  const { id } = account;
  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<number>(defaultAmount);

  const handleSaveClicked = () => {
    onSave({ name, amount, account: id });
    handleClose();
  };

  const handleButtonClicked = (paid: boolean) => {
    onDelete && onDelete(paid);
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
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="payments-due-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        <Box>
          {onDelete && (
            <Fragment>
              <Tooltip title="Pay">
                <IconButton
                  onClick={() => handleButtonClicked(true)}
                  disabled={!name || (!amount && amount !== 0)}>
                  <PaidIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleButtonClicked(false)}
                  disabled={!name || (!amount && amount !== 0)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Fragment>
          )}
        </Box>
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
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>
            }
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
