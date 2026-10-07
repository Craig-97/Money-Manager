import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { formatLongDate, parseIsoDate } from '~/lib/dates';
import { formatBalance, formatMoney, parseMoney } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS, formatShortDate } from '~/lib/payments';
import { linkButtonClasses, stepCardClasses } from './setupClasses';
import { SetupState } from '../../hooks';
import { PAY_FREQUENCY_LABELS, RULES } from '../../setupModel';

export interface FirstCycle {
  cycleEnd: Date;
  balance: number;
  monthly: number;
  oneOffsDueCount: number;
  goingOut: number;
  freeToSpend: number;
}

interface ReviewCardProps {
  label: string;
  onEdit: () => void;
  disabled: boolean;
  children: ReactNode;
}

const ReviewCard = ({ label, onEdit, disabled, children }: ReviewCardProps) => (
  <div className={cn(stepCardClasses, 'flex flex-col gap-1.5 px-[22px] py-5')}>
    <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-muted">
      {label}
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className={linkButtonClasses}>
        Edit
      </button>
    </div>
    {children}
  </div>
);

interface ReviewStepProps {
  setup: SetupState;
  firstCycle: FirstCycle;
  nextPayday: Date | undefined;
}

/* Step 5: everything on one page before it's saved */
export const ReviewStep = ({ setup, firstCycle, nextPayday }: ReviewStepProps) => {
  const { values, saving, goTo } = setup;
  const income = parseMoney(values.income) ?? 0;
  const { oneOffs, regulars } = values;

  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-accent bg-accent-soft px-6 py-[22px]">
        <div>
          <p className="text-[13px] font-semibold text-accent-text">Free to spend this cycle</p>
          <p
            className={cn(
              'mt-1 num text-4xl font-extrabold tracking-[-0.03em]',
              firstCycle.freeToSpend < 0 && 'text-expense'
            )}>
            {formatBalance(firstCycle.freeToSpend)}
          </p>
        </div>
        <p className="max-w-[260px] text-[13px] leading-normal text-muted">
          Until {formatLongDate(firstCycle.cycleEnd, { withYear: false })}, after{' '}
          <span className="num text-expense">{formatMoney(firstCycle.goingOut)}</span> of payments
          due.
        </p>
      </div>

      <div className="grid gap-3.5 min-[53.75rem]:grid-cols-2">
        <ReviewCard label="Payday" onEdit={() => goTo(0)} disabled={saving}>
          <p className="text-base font-bold">
            {PAY_FREQUENCY_LABELS[values.frequency]} · {RULES[values.rule].title.toLowerCase()}
          </p>
          {nextPayday ? (
            <p className="text-[13px] text-muted">
              Next {formatLongDate(nextPayday, { withYear: false })}
            </p>
          ) : null}
        </ReviewCard>
        <ReviewCard label="Take-home pay" onEdit={() => goTo(0)} disabled={saving}>
          <p className="num text-xl font-extrabold">{formatMoney(income)}</p>
          <p className="text-[13px] text-muted">per month</p>
        </ReviewCard>
        <ReviewCard label="Bank balance" onEdit={() => goTo(1)} disabled={saving}>
          <p className="num text-xl font-extrabold">{formatMoney(firstCycle.balance)}</p>
          <p className="text-[13px] text-muted">as of today</p>
        </ReviewCard>
        <ReviewCard label="Coming up" onEdit={() => goTo(3)} disabled={saving}>
          <p className="text-base font-bold">
            {oneOffs.length
              ? `${oneOffs.length} one-off ${oneOffs.length === 1 ? 'payment' : 'payments'}`
              : 'Nothing added'}
          </p>
          <p className="text-[13px] text-muted">{firstCycle.oneOffsDueCount} due this cycle</p>
        </ReviewCard>
      </div>

      <div className={cn(stepCardClasses, 'overflow-hidden')}>
        <div className="flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold text-muted">
          Regular payments ·{' '}
          <span className="num text-expense">{formatMoney(firstCycle.monthly)}</span> a month
          <button
            type="button"
            disabled={saving}
            onClick={() => goTo(2)}
            aria-label="Edit regular payments"
            className={cn(linkButtonClasses, 'ml-auto')}>
            Edit
          </button>
        </div>
        <ul>
          {regulars.map(regular => {
            const name = regular.name.trim();
            const date = parseIsoDate(regular.date);
            return (
              <li
                key={regular.id}
                className="flex min-h-16 items-center gap-3 border-t border-border pr-5 pl-[18px]">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-expense-bg text-sm font-extrabold text-expense">
                  {(name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span className="text-sm font-semibold">{name || 'Untitled payment'}</span>
                  <span className="text-xs text-muted">
                    {FREQUENCY_LABELS[regular.frequency]} · next{' '}
                    {date ? formatShortDate(date) : 'No date'}
                  </span>
                </span>
                <span className="inline-flex h-[26px] items-center rounded-full bg-accent-soft px-2.5 text-xs font-bold whitespace-nowrap text-accent-text">
                  {categoryLabel(regular.category)}
                </span>
                <span className="min-w-[84px] text-right num text-sm font-extrabold text-expense">
                  {formatMoney(parseMoney(regular.amount) ?? 0)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
