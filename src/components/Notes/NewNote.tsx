import { ChangeEvent } from 'react';
import { Fragment, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { addNoteCache, CREATE_NOTE_MUTATION } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountContext } from '~/state';
import { Note } from '~/types';

export const NewNoteCard = () => {
  const { account, user } = useAccountContext();
  const { id } = account;

  const [noteText, setNoteText] = useState<string>('');
  const handleGQLError = useErrorHandler();
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
      onError: handleGQLError
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
    <Card className={`note note--new ${loading && 'note--loading'}`} sx={{ bgcolor: '#2196f3' }}>
      <CardContent className="note__content">
        {!loading ? (
          <Fragment>
            <textarea
              rows={5}
              cols={10}
              placeholder="Type to add a note..."
              value={noteText}
              onChange={handleChange}></textarea>
            <div className="note__footer">
              <Typography
                variant="caption"
                component="small"
                fontWeight={500}
                fontSize="1rem"
                sx={{ opacity: 100 }}>
                {characterLimit - noteText.length} Remaining
              </Typography>
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
      </CardContent>
    </Card>
  );
};
