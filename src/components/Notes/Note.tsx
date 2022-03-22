import { useMutation } from '@apollo/client';
import { CircularProgress, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Fragment } from 'react';
import { deleteNoteCache, DELETE_NOTE_MUTATION } from '../../graphql';
import { getDateFromTimestamp } from '../../utils';

interface NoteProps {
  id?: string;
  body?: string;
  createdAt?: string;
}

export const NoteCard = ({ id, body, createdAt }: NoteProps) => {
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
      ) => deleteNoteCache(cache, note)
    });
  };

  return (
    <div className={`note ${loading && 'note--loading'}`}>
      {!loading ? (
        <Fragment>
          <span>{body}</span>
          <div className="note__footer">
            <small>{createdAt && getDateFromTimestamp(parseInt(createdAt))}</small>
            <IconButton onClick={deleteSelectedNote}>
              <DeleteIcon />
            </IconButton>
          </div>
        </Fragment>
      ) : (
        <div className="loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </div>
  );
};
