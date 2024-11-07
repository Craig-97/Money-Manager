import { ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { Fragment, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import PaidIcon from '@mui/icons-material/Paid';
import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { LoadingIconButton } from '~/components/LoadingIconButton/LoadingIconButton';
import { useAccountContext } from '~/state';
import { OneOffPayment } from '~/types';

interface PaymentsDuePopupProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  defaultName?: string;
  defaultAmount?: number;
  onSave: ({ name, amount, account }: OneOffPayment) => void;
  onDelete?: (paid: boolean) => void;
  loading?: boolean;
}

type LoadingAction = 'save' | 'pay' | 'delete' | null;

export const PaymentsDuePopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = 0,
  onSave,
  onDelete,
  loading = false
}: PaymentsDuePopupProps) => {
  const { account } = useAccountContext();
  const { id } = account;
  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const handleSaveClicked = () => {
    setLoadingAction('save');
    onSave({ name, amount, account: id });
  };

  const handleButtonClicked = (paid: boolean) => {
    if (onDelete) {
      setLoadingAction(paid ? 'pay' : 'delete');
      onDelete(paid);
    }
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

  useEffect(() => {
    if (!loading) {
      setLoadingAction(null);

      // Reset form values after save
      if (loadingAction === 'save') {
        setAmount(0);
        setName('');
      }
    }
  }, [loading, loadingAction]);

  return (
    <Dialog
      disableRestoreFocus
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
              <LoadingIconButton
                tooltip="Pay"
                onClick={() => handleButtonClicked(true)}
                disabled={loading || !name || (!amount && amount !== 0)}
                loading={loading && loadingAction === 'pay'}
                icon={<PaidIcon />}
              />
              <LoadingIconButton
                tooltip="Delete"
                onClick={() => handleButtonClicked(false)}
                disabled={loading || !name || (!amount && amount !== 0)}
                loading={loading && loadingAction === 'delete'}
                icon={<DeleteIcon />}
              />
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
          disabled={loading}
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
          disabled={loading}
          margin="dense"
          id="payment-amount"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleSaveClicked}
          loading={loading && loadingAction === 'save'}
          disabled={loading || !name || (!amount && amount !== 0)}
          color="secondary"
          variant="text">
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
