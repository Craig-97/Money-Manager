import {
  useState,
  useEffect,
  DispatchWithoutAction,
  ChangeEvent,
  KeyboardEvent
} from 'react';
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
import { EDIT_ACCOUNT_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Account } from '../../interfaces';

interface MonthlyIncomePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const MonthlyIncomePopup = ({
  isOpen,
  close
}: MonthlyIncomePopupProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { monthlyIncome, id }: Account = account;
  const [value, setValue] = useState<number>();
  const [editAccount] = useMutation(EDIT_ACCOUNT_MUTATION, {
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
      editAccount({
        variables: { id, account: { monthlyIncome: value } }
      });
    }
    close();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(parseFloat(event.target.value).toFixed(2)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      changeMonthlyIncome();
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} aria-labelledby="form-dialog-title">
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
        <Button onClick={close}>Cancel</Button>
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
