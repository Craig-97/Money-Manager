import { Fragment } from 'react';
import { Repeat } from 'lucide-react';
import { SummaryRow } from '../../usePaymentForm';

interface ScheduleSummaryProps {
  rows: SummaryRow[];
  // Shown instead of the rows while there's nothing to work out yet
  message?: string;
}

/* The schedule as short rows: Repeats, Next due, Renews or Last payment, Reminder */
export const ScheduleSummary = ({ rows, message }: ScheduleSummaryProps) => (
  <div
    role="status"
    className="flex items-center gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
    <Repeat size={16} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
    {message ? (
      <span>{message}</span>
    ) : (
      <dl className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 leading-[1.35]">
        {rows.map(row => (
          <Fragment key={row.label}>
            <dt className="font-semibold whitespace-nowrap opacity-80">{row.label}</dt>
            <dd>{row.value}</dd>
          </Fragment>
        ))}
      </dl>
    )}
  </div>
);
