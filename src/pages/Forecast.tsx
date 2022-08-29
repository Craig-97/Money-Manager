import { ForecastTable } from '../components/Forecast';
import { StandardPage } from '../components/StandardPage';

export const Forecast = () => (
  <StandardPage>
    <h4 className="forecast-header">Forecast</h4>
    <div className="forecast">
      <ForecastTable past={true} />
      <ForecastTable />
    </div>
  </StandardPage>
);
