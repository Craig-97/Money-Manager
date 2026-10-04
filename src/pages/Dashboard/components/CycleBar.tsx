import { useState } from 'react';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { CycleDay, CycleDayKind } from '~/lib/payments';
import { dayTitle } from '../dashboardModel';

// default: the next payday tile; hero: white ticks on the accent card on mobile
type Tone = 'default' | 'hero';

const SEGMENTS: Record<Tone, Record<CycleDayKind, string>> = {
  default: {
    past: 'h-2.5 rounded-full bg-accent opacity-45',
    today: 'h-2.5 rounded-full bg-text',
    future: 'h-2.5 rounded-full bg-track',
    expense: 'h-2.5 rounded-full bg-expense',
    income: 'h-2.5 rounded-full bg-income',
    payday: 'h-2.5 rounded-full bg-accent'
  },
  hero: {
    past: 'h-2 rounded-[3px] bg-white opacity-35',
    today: 'h-4 rounded-sm bg-white',
    future: 'h-2 rounded-[3px] bg-white/14',
    expense: 'h-2 rounded-[3px] bg-[#FF9C96]',
    income: 'h-2 rounded-[3px] bg-[#86EFAC]',
    payday: 'h-2 rounded-[3px] bg-[#86EFAC]'
  }
};

const tagsFor = (day: CycleDay) => [
  ...(day.isLastPayday ? ['Last payday'] : []),
  ...(day.kind === 'today' ? ['Today'] : []),
  ...(day.kind === 'payday' ? ['Payday'] : [])
];

interface CycleBarProps {
  days: CycleDay[];
  tone?: Tone;
  className?: string;
}

/*
 * A tick for each day from the last payday to the next, coloured by what's due. Hovering, focusing
 * or tapping a tick shows that day's payments.
 */
export const CycleBar = ({ days, tone = 'default', className }: CycleBarProps) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      role="list"
      aria-label="Days until payday"
      className={cn('flex', tone === 'hero' ? 'gap-0.5' : 'gap-[3px]', className)}>
      {days.map((day, index) => {
        const tags = tagsFor(day);
        const title = dayTitle(day.date, tags);
        const lines = day.payments.map(p => `${p.name} ${formatPayment(p.signedAmount)}`);
        const label =
          title + (lines.length ? `: ${lines.join(', ')}` : tags.length ? '' : ': nothing due');
        const align =
          index < 5 ? 'left-0' : index > days.length - 6 ? 'right-0' : 'left-1/2 -translate-x-1/2';
        const show = () => setOpen(index);
        const hide = () => setOpen(current => (current === index ? null : current));

        return (
          <div key={index} role="listitem" className="relative flex min-w-0 flex-1">
            <button
              type="button"
              aria-label={label}
              onMouseEnter={show}
              onMouseLeave={hide}
              onFocus={show}
              onBlur={hide}
              onClick={show}
              className={cn(
                'group flex min-w-0 flex-1 cursor-pointer items-center rounded-md p-0',
                tone === 'hero' ? 'h-8 focus-visible:outline-white' : 'h-7'
              )}>
              <span
                className={cn(
                  'flex-1 transition-transform duration-100 group-hover:scale-y-170 group-focus-visible:scale-y-170',
                  SEGMENTS[tone][day.kind]
                )}
              />
            </button>
            {open === index ? (
              <div
                role="tooltip"
                className={cn(
                  'pointer-events-none absolute bottom-[calc(100%+4px)] z-15 flex flex-col gap-[3px] rounded-[14px] border border-border-strong bg-surface px-3 py-[9px] text-xs font-medium whitespace-nowrap text-text shadow-[0_12px_28px_-10px_rgb(0_0_0/0.5)]',
                  align
                )}>
                <span className="font-bold">{title}</span>
                {day.payments.map(payment => (
                  <span
                    key={payment.id}
                    className={cn(
                      'num font-bold',
                      payment.signedAmount < 0 ? 'text-expense' : 'text-income'
                    )}>
                    {payment.name} {formatPayment(payment.signedAmount)}
                  </span>
                ))}
                {!day.payments.length && !tags.length ? (
                  <span className="text-muted">Nothing due</span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
