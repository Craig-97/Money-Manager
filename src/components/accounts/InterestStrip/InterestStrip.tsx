import { Percent } from 'lucide-react';
import { cn } from '~/lib/cn';

interface InterestStripLine {
  tone: 'earning' | 'matured';
  // "Pending interest £0.46"
  short: string;
  // "Added Sun 1 Nov"
  when: string;
}

interface InterestStripProps {
  line: InterestStripLine;
  // What it's about, for a strip that's a button: "Easy access"
  name?: string;
  // Tapping it opens the account
  onClick?: () => void;
  className?: string;
}

/*
 * Interest in one line, full width so a phone's row keeps its room: what's built up and when it's
 * added, or that a fixed term has matured. A savings account's or a debt's.
 */
export const InterestStrip = ({ line, name, onClick, className }: InterestStripProps) => {
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
      aria-label={`${name ? `${name}: ` : ''}${line.short} · ${line.when}`}
      className={classes}>
      {content}
    </button>
  ) : (
    <p className={classes}>{content}</p>
  );
};
