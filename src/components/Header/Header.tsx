import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { BackButton, ForecastButton, NotesButton, LogoutButton } from './Buttons';

export const Header = () => {
  const { pathname } = useLocation();

  // Hide Forecast, notes and back button in mobile view, only show logout
  return (
    <div className="header">
      <h1>Money Manager</h1>
      <div>
        {pathname === '/' && (
          <Fragment>
            <ForecastButton />
            <NotesButton />
            <LogoutButton />
          </Fragment>
        )}
      </div>
      {pathname !== '/' && <BackButton />}
    </div>
  );
};
