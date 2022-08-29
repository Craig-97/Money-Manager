import { Panels, PaydayAlert, Totals } from '../components/Overview';
import { StandardPage } from '../components/StandardPage';

export const Homepage = () => (
  <StandardPage>
    <div className="homepage">
      <PaydayAlert />
      <Totals />
      <Panels />
    </div>
  </StandardPage>
);
