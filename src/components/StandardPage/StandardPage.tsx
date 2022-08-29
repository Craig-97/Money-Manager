import { Header } from '../Header';

interface StandardPageProps {
  children?: React.ReactNode;
  header?: Boolean;
}

export const StandardPage = ({
  children,
  header = true,
}: StandardPageProps) => (
  <div className="page">
    {header && <Header />}
    <main>{children}</main>
    {/* MobileBottomNavigation will only be visible in mobile */}
  </div>
);
