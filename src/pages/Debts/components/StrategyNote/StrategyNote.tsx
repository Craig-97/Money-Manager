import { InfoNote } from '~/components/feedback/InfoNote';
import { PayoffStrategy } from '~/lib/debts';
import { STRATEGIES } from '../../debtsModel';

/* What the chosen strategy does with a cleared debt's payment */
export const StrategyNote = ({ strategy }: { strategy: PayoffStrategy }) => (
  <InfoNote live>
    <b>{STRATEGIES[strategy].label}.</b> {STRATEGIES[strategy].blurb}
  </InfoNote>
);
