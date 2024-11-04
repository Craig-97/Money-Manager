import { ChangeEvent, DispatchWithoutAction, KeyboardEvent } from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface EnterValuePopupProps {
  currentValue: number;
  isOpen: boolean;
  close: DispatchWithoutAction;
  changeValue: (value: number) => void;
  title: string;
  labelText: string;
}

export const EnterValuePopup = ({
  currentValue,
  isOpen,
  close,
  changeValue,
  title,
  labelText
}: EnterValuePopupProps) => {
  const [value, setValue] = useState<number | string>(currentValue);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(event.target.valueAsNumber)) {
      setValue(event.target.valueAsNumber);
    } else {
      setValue('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (value || value === 0)) {
      event.preventDefault();
      changeValue(value as number);
    }
  };

  return (
    <Dialog disableRestoreFocus open={isOpen} onClose={close} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{labelText}</DialogContentText>
        <TextField
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>
            }
          }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          margin="dense"
          id="total"
          type="number"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          onClick={() => changeValue(value as number)}
          color="secondary"
          disabled={!value && value !== 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
