import { Fragment, useState } from 'react';
import { useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, CircularProgress, IconButton, Typography } from '@mui/material';
import { NoteEditPopup } from './NoteEditPopup';
import { DELETE_NOTE_MUTATION, EDIT_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountContext } from '~/state';
import { getDateFromTimestamp } from '~/utils';

interface NoteProps {
  id?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const NoteCard = ({ id, body, createdAt, updatedAt }: NoteProps) => {
  const { user } = useAccountContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleGQLError = useErrorHandler();

  const [editNote, { loading: editNoteLoading }] = useMutation(EDIT_NOTE_MUTATION);

  const editSelectedNote = (body: string) => {
    editNote({
      variables: { id, note: { body } },
      onError: handleGQLError
    });
  };

  const [deleteNote, { loading: delNoteLoading }] = useMutation(DELETE_NOTE_MUTATION);

  const deleteSelectedNote = () => {
    deleteNote({
      variables: { id },
      update: (
        cache,
        {
          data: {
            deleteNote: { note }
          }
        }
      ) => deleteNoteCache(cache, note, user),
      onError: handleGQLError
    });
  };

  const getFooterDate = () => {
    const dateToUse = updatedAt ? updatedAt : createdAt;
    return dateToUse && getDateFromTimestamp(parseInt(dateToUse));
  };

  return (
    <Fragment>
      <Card
        className="note"
        sx={{ bgcolor: '#fff176', maxWidth: { xs: '100%', lg: '312px' }, width: '312px' }}>
        <CardContent className="note__content">
          {!delNoteLoading && !editNoteLoading ? (
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
                  {getFooterDate()}
                </Typography>
                <div>
                  <IconButton onClick={() => setIsOpen(true)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={deleteSelectedNote}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            </Fragment>
          ) : (
            <div className="loading">
              <CircularProgress color="secondary" />
            </div>
          )}
        </CardContent>
      </Card>
      <NoteEditPopup
        isOpen={isOpen}
        defaultBody={body}
        onDelete={deleteSelectedNote}
        close={() => setIsOpen(false)}
        onSave={editSelectedNote}
      />
    </Fragment>
  );
};
