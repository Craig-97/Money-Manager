import { useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { DELETE_NOTE_MUTATION, EDIT_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useAccountContext } from '~/state';
import { getDateFromTimestamp } from '~/utils';
import { NoteEditPopup } from './NoteEditPopup';
import { useErrorHandler } from '~/hooks';

interface NoteProps {
  id?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const NoteCard = ({ id, body, createdAt, updatedAt }: NoteProps) => {
  const {
    state: { user }
  } = useAccountContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
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
      <Card className="note">
        <CardContent className="note__content">
          {!delNoteLoading && !editNoteLoading ? (
            <Fragment>
              <span>{body}</span>
              <div className="note__footer">
                <small>{getFooterDate()}</small>
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
