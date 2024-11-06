import { ChangeEvent, useEffect } from 'react';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { LoadingIconButton } from '../LoadingIconButton';

interface NoteEditPopupProps {
  isOpen: boolean;
  close: () => void;
  defaultBody?: string;
  onSave: (body: string) => void;
  onDelete?: () => void;
  loading?: boolean;
}

type LoadingAction = 'save' | 'delete' | null;

export const NoteEditPopup = ({
  isOpen,
  close,
  defaultBody = '',
  onSave,
  onDelete,
  loading = false
}: NoteEditPopupProps) => {
  const [body, setBody] = useState<string>(defaultBody);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const characterLimit = 200;

  const handleSaveClicked = () => {
    if (body) {
      setLoadingAction('save');
      onSave(body);
    }
  };

  const handleDeleteClicked = () => {
    if (onDelete) {
      setLoadingAction('delete');
      onDelete();
    }
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

  useEffect(() => {
    if (!loading) {
      setLoadingAction(null);
    }
  }, [loading]);

  return (
    <Dialog
      disableRestoreFocus
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      className="note-edit-popup"
      maxWidth="xs"
      fullWidth>
      <DialogTitle id="form-dialog-title">
        Edit Note
        {onDelete && (
          <LoadingIconButton
            tooltip="Delete"
            onClick={() => handleDeleteClicked()}
            disabled={loading || !body}
            loading={loading && loadingAction === 'delete'}
            icon={<DeleteIcon />}
          />
        )}
      </DialogTitle>
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
        <LoadingButton
          onClick={handleSaveClicked}
          loading={loading && loadingAction === 'save'}
          disabled={loading || !body}
          color="secondary"
          variant="text">
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
