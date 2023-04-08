import { useMutation } from '@apollo/client';
import { Button, CircularProgress } from '@mui/material';
import { ChangeEvent, Fragment, useState } from 'react';
import { addNoteCache, CREATE_NOTE_MUTATION } from '~/graphql';
import { Note } from '~/types';
import { useAccountContext } from '~/state';
import { useSnackbar } from 'notistack';

export const NewNoteCard = () => {
  const {
    state: {
      account: { id },
      user
    }
  } = useAccountContext();

  const [noteText, setNoteText] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const characterLimit = 200;

  const [createNote, { loading }] = useMutation(CREATE_NOTE_MUTATION);

  const createNewNote = (note: Note) => {
    createNote({
      variables: { note },
      update: (
        cache,
        {
          data: {
            createNote: { note }
          }
        }
      ) => addNoteCache(cache, note, user),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNoteText(event.target.value);
    }
  };

  const handleSaveClick = () => {
    if (noteText.trim().length > 0) {
      createNewNote({ account: id, body: noteText });
      setNoteText('');
    }
  };

  return (
    <div className={`note note--new ${loading && 'note--loading'}`}>
      {!loading ? (
        <Fragment>
          <textarea
            rows={5}
            cols={10}
            placeholder="Type to add a note..."
            value={noteText}
            onChange={handleChange}></textarea>
          <div className="note__footer">
            <small>{characterLimit - noteText.length} Remaining</small>
            <Button
              className="ghost-button"
              variant="outlined"
              disabled={!noteText}
              onClick={handleSaveClick}>
              Save
            </Button>
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
