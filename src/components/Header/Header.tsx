import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { BackButton, ForecastButton, NotesButton } from './Buttons';

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <div className="header">
      <h1>Money Manager</h1>
      <div>
        {pathname === '/' && (
          <Fragment>
            <ForecastButton />
            <NotesButton />
          </Fragment>
        )}
      </div>
      {pathname !== '/' && <BackButton />}
    </div>
  );
};
