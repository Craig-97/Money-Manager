import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BackButton,
  ForecastButton,
  NotesButton,
  LogoutButton,
} from './Buttons';

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <div className="header">
      <h1>Money Manager</h1>
      <div className="header__buttons">
        {pathname === '/' && (
          <Fragment>
            <ForecastButton />
            <NotesButton />
            <LogoutButton />
          </Fragment>
        )}
        {pathname !== '/' && <BackButton />}
      </div>
    </div>
  );
};
