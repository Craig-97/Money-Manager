import { useState } from 'react';
import { CheckOutlined, CloseOutlined, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, TextField, Typography, useTheme } from '@mui/material';
import { LoadingIconButton } from '../LoadingIconButton';
import { useDeleteNote, useEditNote } from '~/hooks';
import { getDateFromTimestamp } from '~/utils';

interface NoteProps {
  id?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
  index: number;
}

const getFooterDate = (createdAt?: string, updatedAt?: string) => {
  const dateToUse = updatedAt ? updatedAt : createdAt;
  return dateToUse ? getDateFromTimestamp(dateToUse) : '';
};

export const NoteCard = ({ id, body, createdAt, updatedAt, index }: NoteProps) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(body);

  const { editSelectedNote, loading: editLoading } = useEditNote({
    onSuccess: () => setIsEditing(false)
  });

  const { deleteSelectedNote, loading: deleteLoading } = useDeleteNote({
    onSuccess: () => setIsEditing(false)
  });

  const handleSave = () => {
    if (id && editedBody?.trim()) {
      editSelectedNote(id, editedBody);
    }
  };

  const handleDelete = () => {
    if (id) deleteSelectedNote({ noteId: id });
  };

  const noteColor = theme.palette.notes.colors[index % theme.palette.notes.colors.length];

  return (
    <Card
      sx={{
        bgcolor: noteColor,
        backgroundImage: 'unset',
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
        {isEditing ? (
          <TextField
            autoFocus
            fullWidth
            multiline
            value={editedBody}
            onChange={e => setEditedBody(e.target.value)}
            disabled={editLoading}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  p: 0,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'black',
                  overflow: 'auto',
                  maxHeight: '100px',
                  'textarea.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.5)'
                  },
                  '&::-webkit-scrollbar': {
                    width: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '2px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent'
                  }
                }
              }
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'black',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'auto',
              maxHeight: '100px',
              '&::-webkit-scrollbar': {
                width: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '2px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              }
            }}>
            {body}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.9rem',
              color: 'rgba(0, 0, 0, 0.7)',
              fontWeight: 500
            }}>
            {getFooterDate(createdAt, updatedAt)}
          </Typography>
          <Box>
            {isEditing ? (
              <>
                <LoadingIconButton
                  onClick={handleSave}
                  disabled={editLoading || !editedBody?.trim()}
                  loading={editLoading}
                  icon={<CheckOutlined />}
                  sx={{ color: 'black' }}
                  progressColor="black"
                />
                <IconButton
                  onClick={() => {
                    setIsEditing(false);
                    setEditedBody(body);
                  }}
                  sx={{ color: 'black' }}>
                  <CloseOutlined />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton onClick={() => setIsEditing(true)} sx={{ color: 'black' }}>
                  <EditOutlined />
                </IconButton>
                <LoadingIconButton
                  onClick={handleDelete}
                  loading={deleteLoading}
                  icon={<DeleteOutline />}
                  sx={{ color: 'black' }}
                  progressColor="black"
                />
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
