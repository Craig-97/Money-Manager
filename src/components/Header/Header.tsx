import IconButton from '@mui/material/IconButton';
import NoteRounded from '@mui/icons-material/NoteRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { DispatchWithoutAction } from 'react';
import { Mode } from '../../interfaces';

interface HeaderProps {
  mode: Mode;
  updateMode: DispatchWithoutAction;
}

export const Header = ({ mode, updateMode }: HeaderProps) => (
  <div className="header">
    <h1>Money Manager</h1>
    <IconButton onClick={updateMode}>
      {mode.OVERVIEW && <NoteRounded />}
      {mode.NOTES && <ArrowBackRoundedIcon />}
    </IconButton>
  </div>
);
