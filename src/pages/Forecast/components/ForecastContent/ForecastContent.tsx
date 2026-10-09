import { MEDIA } from '~/constants';
import { Account } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useForecast } from '../../hooks';
import { ProjectionChart } from '../chart';
import { KeyFigures, MobileKeyFigures, SpendCard } from '../figures';
import { MonthTable } from '../table';

/* The forecast once the account has loaded. Only one layout is rendered. */
export const ForecastContent = ({ account }: { account: Account }) => {
  const forecast = useForecast(account);
  const isDesktop = useMediaQuery(MEDIA.desktop);

  return isDesktop ? (
    <>
      <KeyFigures forecast={forecast} />
      <section className="grid gap-4 min-[68.8125rem]:grid-cols-3">
        <SpendCard forecast={forecast} />
        <ProjectionChart forecast={forecast} />
      </section>
      <MonthTable forecast={forecast} />
    </>
  ) : (
    <>
      <MobileKeyFigures forecast={forecast} />
      <SpendCard forecast={forecast} compact />
      <ProjectionChart forecast={forecast} compact />
      <MonthTable forecast={forecast} compact />
    </>
  );
};
