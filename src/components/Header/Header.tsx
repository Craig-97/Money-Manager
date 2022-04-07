import { Fragment } from 'react';
import { Mode } from '../../interfaces';
import { BackButton, ForecastButton, NotesButton } from './Buttons';

interface HeaderProps {
  mode: Mode;
  updateMode: (mode: string) => void;
}

export const Header = ({ mode, updateMode }: HeaderProps) => (
  <div className="header">
    <h1>Money Manager</h1>
    <div>
      {mode.OVERVIEW && (
        <Fragment>
          <ForecastButton updateMode={updateMode} />
          <NotesButton updateMode={updateMode} />
        </Fragment>
      )}
    </div>
    {!mode.OVERVIEW && <BackButton updateMode={updateMode} />}
  </div>
);
