import { Fragment, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, IconButton, Typography } from '@mui/material';
import { NoteEditPopup } from './NoteEditPopup';
import { LoadingIconButton } from '../LoadingIconButton';
import { useDeleteNote, useEditNote } from '~/hooks';
import { getDateFromTimestamp } from '~/utils';

interface NoteProps {
  id?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getFooterDate = (createdAt?: string, updatedAt?: string) => {
  const dateToUse = updatedAt ? updatedAt : createdAt;
  return dateToUse && getDateFromTimestamp(parseInt(dateToUse));
};

export const NoteCard = ({ id, body, createdAt, updatedAt }: NoteProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const { editSelectedNote, loading: editNoteLoading } = useEditNote({ onSuccess: handleClose });
  const { deleteSelectedNote, loading: delNoteLoading } = useDeleteNote({
    onSuccess: handleClose
  });

  const handleEditNote = (body: string) => {
    if (id) editSelectedNote(id, body);
  };

  const handleDeleteNote = () => {
    if (id) deleteSelectedNote({ noteId: id });
  };

  return (
    <Fragment>
      <Card
        className="note"
        sx={{ bgcolor: '#fff176', maxWidth: { xs: '100%', lg: '312px' }, width: '312px' }}>
        <CardContent className="note__content">
          <Fragment>
            <Typography variant="body1" fontWeight={500}>
              {body}
            </Typography>
            <div className="note__footer">
              <Typography
                variant="caption"
                component="small"
                fontWeight={500}
                fontSize="1rem"
                sx={{ opacity: 85 }}>
                {getFooterDate(createdAt, updatedAt)}
              </Typography>
              <div>
                <IconButton onClick={() => setIsOpen(true)}>
                  <EditIcon />
                </IconButton>
                <LoadingIconButton
                  tooltip="Delete"
                  progressColor="black"
                  onClick={handleDeleteNote}
                  disabled={delNoteLoading}
                  loading={delNoteLoading}
                  icon={<DeleteIcon />}
                />
              </div>
            </div>
          </Fragment>
        </CardContent>
      </Card>
      <NoteEditPopup
        isOpen={isOpen}
        defaultBody={body}
        onDelete={handleDeleteNote}
        close={handleClose}
        onSave={handleEditNote}
        loading={editNoteLoading || delNoteLoading}
      />
    </Fragment>
  );
};
