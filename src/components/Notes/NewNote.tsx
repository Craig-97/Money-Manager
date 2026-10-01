import { ChangeEvent, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, TextField, Typography } from '@mui/material';
import { LoadingIconButton } from '../LoadingIconButton';
import { useCreateNote } from '~/hooks';
import { useAccountStore } from '~/state';

interface NewNoteCardProps {
  onSave?: () => void;
}

export const NewNoteCard = ({ onSave }: NewNoteCardProps) => {
  const id = useAccountStore(s => s.account.id);
  const [noteText, setNoteText] = useState<string>('');
  const characterLimit = 200;

  const { createNewNote, loading } = useCreateNote();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (characterLimit - event.target.value.length >= 0) {
      setNoteText(event.target.value);
    }
  };

  const handleSave = () => {
    if (noteText.trim().length > 0) {
      createNewNote({
        note: { account: id, body: noteText },
        onSuccess: () => {
          setNoteText('');
          onSave?.();
        }
      });
    }
  };

  return (
    <Card
      sx={{
        bgcolor: 'primary.main',
        position: 'relative',
        height: '200px',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <CardContent
        sx={{
          flex: 1,
          p: 3,
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
        <TextField
          autoFocus
          fullWidth
          multiline
          placeholder="Start typing your note here..."
          value={noteText}
          onChange={handleChange}
          disabled={loading}
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontSize: '1rem',
                fontWeight: 500,
                color: 'white',
                overflow: 'auto',
                maxHeight: '100px',
                '&::-webkit-scrollbar': {
                  width: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent'
                },
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.8)',
                  opacity: 1
                }
              }
            }
          }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              opacity: 0.8,
              fontWeight: 500
            }}>
            {characterLimit - noteText.length} characters remaining
          </Typography>
          <Box>
            <LoadingIconButton
              onClick={handleSave}
              disabled={!noteText.trim() || loading}
              loading={loading}
              icon={<CheckOutlined />}
              sx={{ color: 'white' }}
            />
            <IconButton onClick={onSave} sx={{ color: 'white' }}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
