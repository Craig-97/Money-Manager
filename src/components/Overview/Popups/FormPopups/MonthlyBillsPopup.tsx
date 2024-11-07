import { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { LoadingIconButton } from '~/components/LoadingIconButton';
import { useAccountContext } from '~/state';
import { Bill } from '~/types';

interface MonthlyBillsPopupProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  defaultName?: string;
  defaultAmount?: number;
  defaultPaid?: boolean;
  onSave: ({ name, amount, paid, account }: Bill) => void;
  onDelete?: () => void;
  loading?: boolean;
}

type LoadingAction = 'save' | 'delete' | null;

export const MonthlyBillsPopup = ({
  title,
  isOpen,
  close,
  defaultName = '',
  defaultAmount = 0,
  defaultPaid = false,
  onSave,
  onDelete,
  loading = false
}: MonthlyBillsPopupProps) => {
  const { account } = useAccountContext();
  const { id } = account;

  const [name, setName] = useState<string>(defaultName);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paid, setPaid] = useState<boolean>(defaultPaid);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const handleSaveClicked = () => {
    setLoadingAction('save');
    onSave({ name, amount, paid, account: id });
  };

  const handleDeleteClicked = () => {
    if (onDelete) {
      setLoadingAction('delete');
      onDelete();
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
    setPaid(false);
  };

  useEffect(() => {
    if (!loading) {
      setLoadingAction(null);

      // Reset form values after save
      if (loadingAction === 'save') {
        setAmount(0);
        setName('');
        setPaid(false);
      }
    }
  }, [loading, loadingAction]);

  return (
    <Dialog
      disableRestoreFocus
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="monthly-bills-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        {title}
        {onDelete && (
          <LoadingIconButton
            tooltip="Delete"
            onClick={() => handleDeleteClicked()}
            disabled={loading || !name || (!amount && amount !== 0)}
            loading={loading && loadingAction === 'delete'}
            icon={<DeleteIcon />}
          />
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
