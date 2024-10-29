import NoteRounded from '@mui/icons-material/NoteRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '~/types';

export const NotesButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title={PAGES.NOTES}>
      <IconButton onClick={() => navigate('/notes')}>
        <NoteRounded />
      </IconButton>
    </Tooltip>
  );
};
