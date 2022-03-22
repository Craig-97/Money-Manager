import IconButton from '@material-ui/core/IconButton';
import NoteRounded from '@material-ui/icons/NoteRounded';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';
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
