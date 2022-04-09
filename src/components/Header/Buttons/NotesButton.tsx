import NoteRounded from '@mui/icons-material/NoteRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MODES } from '../../../constants';
import { ButtonProps } from '../../../types';
import { capitalize } from '../../../utils';

export const NotesButton = ({ updateMode }: ButtonProps) => (
  <Tooltip title={capitalize(MODES.NOTES)}>
    <IconButton onClick={() => updateMode(MODES.NOTES)}>
      <NoteRounded />
    </IconButton>
  </Tooltip>
);
