import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { ChangeEvent, DispatchWithoutAction, useState } from 'react';

interface NoteEditPopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
  defaultBody?: string;
  onSave: (body: string) => void;
  onDelete?: DispatchWithoutAction;
}

export const NoteEditPopup = ({
  isOpen,
  close,
  defaultBody = '',
  onSave,
  onDelete
}: NoteEditPopupProps) => {
  const [body, setBody] = useState<string>(defaultBody);
  const characterLimit = 200;

  const handleSaveClicked = () => {
    body && onSave(body);
    // OG close function to avoid body being reset
    close();
  };

  const handleDeleteClicked = () => {
    onDelete && onDelete();
    handleClose();
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (characterLimit - event.target.value.length >= 0) {
      setBody(event.target.value);
    }
  };

  const handleClose = () => {
    close();
    setBody(defaultBody);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="note-edit-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        Edit Note
        {onDelete && (
          <IconButton onClick={handleDeleteClicked} disabled={!body}>
            <DeleteIcon />
          </IconButton>
        )}
      </DialogTitle>
      {/* TODO: Fix font family for textarea */}
      <DialogContent>
        <textarea
          rows={5}
          cols={10}
          placeholder="Type to add a note..."
          value={body}
          onChange={handleChange}></textarea>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSaveClicked} color="secondary" disabled={!body}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
