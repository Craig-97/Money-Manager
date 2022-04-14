import { Header } from '../components/Header';
import { Overview } from '../components/Overview';

export const Homepage = () => {
  return (
    <div className="page">
      <Header />
      <main>
        <div className="container">
          <Overview />
        </div>
      </main>
    </div>
  );
};
