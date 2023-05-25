import { useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { DELETE_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useAccountContext } from '~/state';
import { getDateFromTimestamp } from '~/utils';
import { PaymentsDuePopup } from '../Overview';

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

  const [deleteNote, { loading }] = useMutation(DELETE_NOTE_MUTATION);

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
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
          {!loading ? (
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

      <PaymentsDuePopup
        title="Add Upcoming Payment"
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        onSave={() => console.log('test')}
      />
    </Fragment>
  );
};
