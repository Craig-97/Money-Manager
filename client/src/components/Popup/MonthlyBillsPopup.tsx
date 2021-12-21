import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  useEffect,
  useState
} from 'react';
import { Account, Bill } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
interface MonthlyBillsPopupProps {
  title: string;
  open: boolean;
  setOpen: Dispatch<boolean>;
  defaultName?: string;
  defaultAmount?: number;
  defaultPaid?: boolean;
  onSave: ({ name, amount, paid, account }: Bill) => void;
}

export const MonthlyBillsPopup = ({
  title,
  open,
  setOpen,
  defaultName = '',
  defaultAmount,
  defaultPaid = false,
  onSave
}: MonthlyBillsPopupProps) => {
  const {
    state: { account }
  } = useAccountContext();

  const { id }: Account = account;
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<number>();
  const [paid, setPaid] = useState<boolean>(false);

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
    onSave({ name, amount, paid, account: id });
    handleClose();
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(parseFloat(event.target.value).toFixed(2)));
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
    setOpen(false);
    setAmount(defaultAmount);
    setName('');
    setPaid(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="monthly-bills-popup"
      maxWidth={'xs'}
      fullWidth
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
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
