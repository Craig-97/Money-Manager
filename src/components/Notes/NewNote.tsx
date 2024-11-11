import { ChangeEvent, Fragment, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Card, CardContent, Typography } from '@mui/material';
import { useCreateNote } from '~/hooks';
import { useAccountStore } from '~/state';

export const NewNoteCard = () => {
  const id = useAccountStore(s => s.account.id);
  const [noteText, setNoteText] = useState<string>('');
  const characterLimit = 200;

  const { createNewNote, loading } = useCreateNote();

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNoteText(event.target.value);
    }
  };

  const handleSaveClick = () => {
    if (noteText.trim().length > 0) {
      createNewNote({
        note: { account: id, body: noteText }
      });
      setNoteText('');
    }
  };

  return (
    <Card
      className={`note note--new ${loading && 'note--loading'}`}
      sx={{ bgcolor: '#2196f3', maxWidth: { xs: '100%', lg: '312px' }, width: '312px' }}>
      <CardContent className="note__content">
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
            <LoadingButton
              disabled={!noteText}
              onClick={handleSaveClick}
              loading={loading}
              className="ghost-button"
              variant="outlined">
              Save
            </LoadingButton>
          </div>
        </Fragment>
      </CardContent>
    </Card>
  );
};
