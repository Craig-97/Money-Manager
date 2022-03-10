import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  ChangeEvent,
  DispatchWithoutAction,
  KeyboardEvent,
  useEffect,
  useState
} from 'react';
import { Account, OneOffPayment } from '../../../interfaces';
import { useAccountContext } from '../../../state/account-context';
import { getNumberAmount, stringToFixedNumber } from '../../../utils';
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
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>();

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
    const number = stringToFixedNumber(event.target.value);
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
      fullWidth
    >
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
        <Button
          onClick={handleSaveClicked}
          color="secondary"
          disabled={!name || !amount}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
