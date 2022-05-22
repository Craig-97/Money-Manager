import { Header } from '../components/Header';
import { Totals, PaydayAlert, Panels } from '../components/Overview';

// NEED TO CREATE A REUSABLE PAGE COMPONENT

export const Homepage = () => (
  <div className="page">
    <Header />
    <main>
      <div className="homepage">
        <PaydayAlert />
        <Totals />
        <Panels />
      </div>
    </main>
    {/* MobileBottomNavigation will only be visible in mobile */}
  </div>
);
