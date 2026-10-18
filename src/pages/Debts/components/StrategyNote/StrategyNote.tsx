import { Info } from 'lucide-react';
import { PayoffStrategy } from '~/lib/debts';
import { STRATEGIES } from '../../debtsModel';

/* What the chosen strategy does with a cleared debt's payment */
export const StrategyNote = ({ strategy }: { strategy: PayoffStrategy }) => (
  <p
    aria-live="polite"
    className="flex items-start gap-2.5 rounded-[18px] border border-border bg-surface-2 px-4 py-3 text-[13px] leading-[1.45] font-medium text-muted">
    <Info size={16} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
    <span>
      <b className="font-bold text-text">{STRATEGIES[strategy].label}.</b>{' '}
      {STRATEGIES[strategy].blurb}
    </span>
  </p>
);
