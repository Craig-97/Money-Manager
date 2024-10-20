import { Panels, PaydayAlert, Totals, StandardPage } from '~/components';

export const Homepage = () => (
  <StandardPage>
    <div className="homepage">
      <PaydayAlert />
      <Totals />
      <Panels />
    </div>
  </StandardPage>
);
