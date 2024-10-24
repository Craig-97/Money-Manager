import { Fragment } from 'react/jsx-runtime';
import { BottomNav } from '../BottomNav';
import { Header } from '../Header';

interface StandardPageProps {
  children?: React.ReactNode;
  header?: Boolean;
  bottomNav?: Boolean;
}

export const StandardPage = ({ children, header = true, bottomNav = true }: StandardPageProps) => (
  <Fragment>
    <div className="page">
      {header && <Header />}
      <main>{children}</main>
    </div>
    {bottomNav && <BottomNav />}
  </Fragment>
);
