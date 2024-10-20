import { ForecastTable, StandardPage } from '~/components';

export const Forecast = () => (
  <StandardPage>
    <h4 className="forecast-header">Forecast</h4>
    <div className="forecast">
      <ForecastTable past={true} />
      <ForecastTable />
    </div>
  </StandardPage>
);
