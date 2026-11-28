import { cn } from '~/lib/cn';
import { formatMoney, formatPayment } from '~/lib/format';

interface ListTotalProps {
  // Positive for money in, negative for money out
  net: number;
  // A monthly figure: "/mo", with "≈" when some payments count at their average
  perMonth?: boolean;
  approx?: boolean;
  // Quarterly and yearly payments, as a yearly figure under the monthly one
  annual?: number;
  compact?: boolean;
}

/* A list's total, under the list */
export const ListTotal = ({
  net,
  perMonth = false,
  approx = false,
  annual = 0,
  compact = false
}: ListTotalProps) => (
  <div className="flex flex-col items-end gap-0.5">
    <p className="flex items-baseline gap-2.5">
      {compact ? null : <span className="text-[13px] font-semibold text-muted">Net total</span>}
      <span
        className={cn(
          'num font-extrabold',
          compact ? 'text-lg' : 'text-xl',
          net >= 0 ? 'text-income' : 'text-expense'
        )}>
        {approx ? <span className="text-muted">≈ </span> : null}
        {formatPayment(net)}
        {perMonth ? <span className="text-sm font-semibold text-muted"> /mo</span> : null}
      </span>
    </p>
    {annual > 0 ? (
      <p className="text-xs font-medium text-muted">
        + <span className="num font-bold text-text">{formatMoney(annual)}</span> /yr
      </p>
    ) : null}
  </div>
);
