import { ChangeEvent, MouseEvent } from 'react';
import { useMutation } from '@apollo/client';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, CircularProgress, IconButton } from '@mui/material';
import { Fragment, useState } from 'react';
import { deleteNoteCache, DELETE_NOTE_MUTATION, EDIT_NOTE_MUTATION } from '~/graphql';
import { useAccountContext } from '~/state';
import { getDateFromTimestamp } from '~/utils';
import { useSnackbar } from 'notistack';
import { Note } from '~/types';

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
  const { enqueueSnackbar } = useSnackbar();
  const [editMode, setEditMode] = useState<Boolean>(false);
  const [noteText, setNoteText] = useState<string>(body || '');
  const characterLimit = 200;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNoteText(event.target.value);
    }
  };

  const handleDoubleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!editMode) setEditMode(true);
  };

  const handleSaveClick = () => {
    if (noteText.trim().length > 0) {
      editSelectedNote({ body: noteText });
      setEditMode(false);
      setNoteText('');
    }
  };
  const [editNote, { loading: editLoading }] = useMutation(EDIT_NOTE_MUTATION);

  const editSelectedNote = (note: Note) => {
    editNote({
      variables: { id, note },
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const [deleteNote, { loading: deleteLoading }] = useMutation(DELETE_NOTE_MUTATION);

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

  const loading = deleteLoading || editLoading;

  // https://github.com/minwork/use-double-tap

  return (
    <div className={`note ${loading && 'note--loading'}`}>
      {!loading ? (
        <div className="note__content" onDoubleClick={e => handleDoubleClick(e)}>
          {!editMode ? (
            <Fragment>
              <span>{body}</span>
              <div className="note__footer">
                <small>{getFooterDate()}</small>
                <IconButton onClick={deleteSelectedNote}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <textarea
                rows={5}
                cols={10}
                placeholder={noteText || 'Type to edit note...'}
                value={noteText}
                onChange={handleChange}></textarea>
              <div className="note__footer">
                <small>{characterLimit - noteText.length} Remaining</small>
                <Button
                  className="ghost-button"
                  variant="outlined"
                  disabled={body === noteText}
                  onClick={handleSaveClick}>
                  Save
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      ) : (
        <div className="loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </div>
  );
};
