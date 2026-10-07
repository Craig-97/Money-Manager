import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { cn } from '~/lib/cn';
import { SegmentKind, useDueDemo } from '../../hooks';

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const wholePounds = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0
});

const SEGMENT_CLASSES: Record<SegmentKind, string> = {
  past: 'bg-accent opacity-45',
  today: 'bg-text',
  income: 'bg-income',
  expense: 'bg-expense',
  payday: 'bg-accent',
  future: 'bg-track'
};

const chipClasses = 'rounded-2xl bg-hero-chip px-3 py-2.5';

/* The cards beside the hero text: free to spend, days to payday and a list you can tick off */
export const HeroDemo = () => {
  const {
    payments,
    toggle,
    bankBalance,
    upcoming,
    freeToSpend,
    perDay,
    daysToPayday,
    unpaidCount,
    segments
  } = useDueDemo();

  const free = gbp.format(freeToSpend);
  const pence = free.lastIndexOf('.');

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-3.5">
      <div className="relative overflow-hidden rounded-[26px] bg-hero-bg p-[22px] text-hero-text md:rounded-[28px] md:px-7 md:py-[26px]">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-[70px] size-[210px] rounded-full bg-hero-chip md:-top-[90px] md:-right-20 md:size-[260px]"
        />
        <div className="relative flex items-center justify-between gap-2 md:gap-3">
          <span className="text-[13px] font-bold text-hero-muted md:text-sm">Free to spend</span>
          <span className="inline-flex h-7 items-center rounded-full bg-hero-chip px-2.5 text-[11px] font-bold md:h-[30px] md:px-3 md:text-xs">
            Until Fri 30 Oct
          </span>
        </div>
        <p className="relative mt-2 num text-[50px] leading-none font-extrabold tracking-[-0.05em] md:mt-2.5 md:text-[64px]">
          {free.slice(0, pence)}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">
            {free.slice(pence)}
          </span>
        </p>
        <p className="relative mt-2 text-[13px] font-semibold text-hero-muted md:mt-2.5 md:text-sm">
          About{' '}
          <span className="num font-extrabold text-hero-text">{wholePounds.format(perDay)}</span> a
          day for the next {daysToPayday} days
        </p>
        <div
          aria-hidden="true"
          className="relative mt-[18px] grid grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)] items-center gap-1.5 md:mt-[22px] md:grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)]">
          <div className={chipClasses}>
            <p className="text-[11px] font-semibold text-hero-muted">Bank balance</p>
            <p className="mt-[3px] num text-sm font-extrabold">{gbp.format(bankBalance)}</p>
          </div>
          <p className="text-center text-base font-bold text-hero-muted">
            {upcoming > 0 ? '+' : '−'}
          </p>
          <div className={chipClasses}>
            <p className="text-[11px] font-semibold text-hero-muted">Upcoming</p>
            <p className="mt-[3px] num text-sm font-extrabold">{gbp.format(Math.abs(upcoming))}</p>
          </div>
          <p className="hidden text-center text-base font-bold text-hero-muted md:block">=</p>
          <div className="hidden rounded-2xl bg-hero-text px-3 py-2.5 text-hero-bg md:block">
            <p className="text-[11px] font-bold opacity-70">Free to spend</p>
            <p className="mt-[3px] num text-sm font-extrabold">{free}</p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="rounded-3xl border border-border bg-surface px-[18px] py-4 md:rounded-[28px] md:px-[22px] md:py-5">
        <div className="flex items-baseline justify-between gap-2 md:gap-3">
          <div className="flex items-baseline gap-2">
            <span className="num text-[28px] leading-none font-extrabold tracking-[-0.05em] md:text-[32px]">
              {daysToPayday}
            </span>
            <span className="text-[13px] font-bold text-muted md:text-sm">days to payday</span>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-accent-text md:px-3 md:text-[13px]">
            Fri 30 Oct
          </span>
        </div>
        <div className="mt-3.5 flex gap-0.5 md:mt-4 md:gap-[3px]">
          {segments.map((kind, day) => (
            <span
              key={day}
              className={cn('h-2.5 min-w-0 flex-1 rounded-full', SEGMENT_CLASSES[kind])}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface md:rounded-[28px]">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 md:px-5 md:pt-[18px] md:pb-3.5">
          <div>
            <p className="text-[15px] font-extrabold">Due before payday</p>
            <p className="mt-0.5 text-xs font-medium text-muted">Try ticking one off</p>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1.5 num text-xs font-bold whitespace-nowrap text-accent-text md:px-3 md:text-[13px]">
            {unpaidCount} left
          </span>
        </div>
        <ul>
          {payments.map(payment => {
            const id = `demo-${payment.key}`;
            return (
              <li
                key={payment.key}
                className="flex min-h-[60px] items-center gap-2 border-t border-border pr-4 pl-1">
                <CheckboxHitArea htmlFor={id}>
                  <Checkbox
                    id={id}
                    size="md"
                    checked={payment.paid}
                    onChange={() => toggle(payment.key)}
                  />
                </CheckboxHitArea>
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
                  {payment.name[0]}
                </span>
                <label htmlFor={id} className="min-w-0 grow cursor-pointer pl-1">
                  <span className="block text-sm font-bold md:text-[15px]">{payment.name}</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted">{payment.sub}</span>
                </label>
                {payment.paid ? (
                  <span className="rounded-full bg-income-bg px-2 py-1 text-[11px] font-bold text-income">
                    Paid
                  </span>
                ) : null}
                <span
                  className={cn(
                    'num text-sm font-extrabold md:text-[15px]',
                    payment.paid
                      ? 'text-muted line-through'
                      : payment.amount < 0
                        ? 'text-expense'
                        : 'text-income'
                  )}>
                  {payment.amount < 0
                    ? gbp.format(-payment.amount)
                    : `+${gbp.format(payment.amount)}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
