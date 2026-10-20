import { cn } from '~/lib/cn';

export interface ReviewLine {
  key: string;
  name: string;
  details: string;
  amount: string;
  tone?: 'income' | 'expense';
  tag?: string;
}

/* The accounts or payments in a review card, or what to say when there are none */
export const ReviewLines = ({ lines, empty }: { lines: ReviewLine[]; empty: string }) =>
  lines.length ? (
    <ul className="-mx-1 mt-1">
      {lines.map(line => (
        <li
          key={line.key}
          className="flex min-h-14 items-center gap-3 border-t border-border px-1 py-2 first:border-t-0">
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2 text-sm font-bold [overflow-wrap:anywhere]">
              {line.name}
              {line.tag ? (
                <span className="inline-flex h-[22px] items-center rounded-full bg-accent-soft px-2 text-[11px] font-bold whitespace-nowrap text-accent-text">
                  {line.tag}
                </span>
              ) : null}
            </span>
            {line.details ? (
              <span className="text-xs font-semibold [overflow-wrap:anywhere] text-muted">
                {line.details}
              </span>
            ) : null}
          </span>
          <span
            className={cn(
              'shrink-0 num text-sm font-extrabold whitespace-nowrap',
              line.tone === 'income' && 'text-income',
              line.tone === 'expense' && 'text-expense'
            )}>
            {line.amount}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-[13px] text-muted">{empty}</p>
  );
