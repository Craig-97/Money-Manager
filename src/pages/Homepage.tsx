import { Header } from '../components/Header';
import { Totals, PaydayAlert, Panels } from '../components/Overview';

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
  </div>
);
