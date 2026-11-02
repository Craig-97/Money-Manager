import { Percent } from 'lucide-react';
import { Account, interestLine } from '~/lib/accounts';
import { cn } from '~/lib/cn';

interface InterestStripProps {
  account: Account;
  today: Date;
  // Tapping it opens the account, or checking a payment that's waiting
  onClick?: () => void;
  className?: string;
}

/*
 * A savings account's interest in one line, full width so a phone's row keeps its room: what's built
 * up and when it's paid, or a payment waiting to be checked. Nothing without a schedule.
 */
export const InterestStrip = ({ account, today, onClick, className }: InterestStripProps) => {
  const line = interestLine(account, today);
  if (!line) return null;
  const classes = cn(
    'flex min-h-9 w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-xs leading-[1.35] font-bold',
    line.tone === 'earning' ? 'bg-income-bg text-income' : 'bg-warn-bg text-warn',
    onClick && 'cursor-pointer',
    className
  );
  const content = (
    <>
      <Percent size={14} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{line.short}</span>
      <span className="shrink-0 font-extrabold whitespace-nowrap">{line.when}</span>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${account.name} interest: ${line.text}`}
      className={classes}>
      {content}
    </button>
  ) : (
    <p className={classes}>{content}</p>
  );
};
