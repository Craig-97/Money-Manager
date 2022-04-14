import { ForecastTable } from '../components/Forecast';
import { Header } from '../components/Header';

export const Forecast = () => (
  <div className="page">
    <Header />
    <main>
      <h4 className="forecast-header">Forecast</h4>
      <div className="forecast">
        <ForecastTable past={true} />
        <ForecastTable />
      </div>
    </main>
  </div>
);
