import { cn } from '~/lib/cn';
import { formatLongDate } from '~/lib/dates';
import { formatBalance, formatMoney, formatPayment, parseMoney } from '~/lib/format';
import { SetupState } from '../../../hooks';
import { FirstCycle, PAY_FREQUENCY_LABELS, RULES, setupAccounts } from '../../../setupModel';
import { oneOffDetails, regularDetails } from '../../../setupPayments';
import { ReviewCard } from '../ReviewCard';
import { ReviewLines } from '../ReviewLines';

interface ReviewStepProps {
  setup: SetupState;
  firstCycle: FirstCycle;
  nextPayday: Date | undefined;
  today: Date;
}

/*
 * Step 5: everything on one page before it's saved, in the order it was asked. Each card is full
 * width, so a long list never leaves a gap beside a short one.
 */
export const ReviewStep = ({ setup, firstCycle, nextPayday, today }: ReviewStepProps) => {
  const { values, saving, goTo } = setup;
  const income = parseMoney(values.income) ?? 0;
  const accounts = setupAccounts(values);
  const signed = (input: { amount: number; type: string }) =>
    formatPayment(input.type === 'INCOME' ? input.amount : -input.amount);
  const toneOf = (input: { type: string }) => (input.type === 'INCOME' ? 'income' : 'expense');

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

      <ReviewCard label="Pay" onEdit={() => goTo(0)} disabled={saving}>
        <p className="text-base font-bold">
          {PAY_FREQUENCY_LABELS[values.frequency]} · {RULES[values.rule].title.toLowerCase()}
        </p>
        <p className="text-[13px] text-muted">
          <span className="num font-bold text-text">{formatMoney(income)}</span> take-home pay
          {nextPayday ? ` · next ${formatLongDate(nextPayday, { withYear: false })}` : ''}
        </p>
      </ReviewCard>

      <ReviewCard label="Your accounts" onEdit={() => goTo(1)} disabled={saving}>
        <ReviewLines
          empty="None added"
          lines={accounts.map(account => ({
            key: account.id,
            name: account.name,
            details: account.paidInto
              ? 'Spending'
              : [
                  account.kind === 'SPENDING' ? 'Spending' : 'Savings',
                  account.counts ? null : 'Kept out of free to spend'
                ]
                  .filter(Boolean)
                  .join(' · '),
            amount: formatBalance(account.balance),
            tag: account.paidInto && accounts.length > 1 ? 'Where you get paid' : undefined
          }))}
        />
      </ReviewCard>

      <ReviewCard label="Regular payments" onEdit={() => goTo(2)} disabled={saving}>
        <ReviewLines
          empty="None added"
          lines={values.regulars.map(regular => ({
            key: regular.id,
            name: regular.input.name,
            details: regularDetails(regular, { accounts, today }),
            amount: signed(regular.input),
            tone: toneOf(regular.input)
          }))}
        />
      </ReviewCard>

      <ReviewCard label="Coming up" onEdit={() => goTo(3)} disabled={saving}>
        <ReviewLines
          empty="Nothing added"
          lines={values.oneOffs.map(oneOff => ({
            key: oneOff.id,
            name: oneOff.input.name,
            details: oneOffDetails(oneOff, { accounts, today }),
            amount: signed(oneOff.input),
            tone: toneOf(oneOff.input)
          }))}
        />
      </ReviewCard>
    </section>
  );
};
