import { cn } from '~/lib/cn';
import { formatLongDate } from '~/lib/dates';
import { formatBalance, formatMoney, MINUS, parseMoney } from '~/lib/format';
import { SetupState, useSetupDesktop } from '../../../hooks';
import {
  accountDetails,
  FirstCycle,
  PAY_FREQUENCY_LABELS,
  RULES,
  setupAccounts
} from '../../../setupModel';
import { oneOffDetails, regularDetails, regularNext } from '../../../setupPayments';
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
 * width, so a long list never leaves a gap beside a short one. Mobile leads with the accent card,
 * as the summary beside the form isn't there.
 */
export const ReviewStep = ({ setup, firstCycle, nextPayday, today }: ReviewStepProps) => {
  const isDesktop = useSetupDesktop();
  const { values, saving, goTo } = setup;
  const income = parseMoney(values.income) ?? 0;
  const accounts = setupAccounts(values);
  const counted = accounts.filter(account => account.counts);
  // Desktop leaves money out unsigned, in red; mobile's board signs it
  const amountOf = (input: { amount: number; type: string }) =>
    (input.type === 'INCOME' ? '+' : isDesktop ? '' : MINUS) + formatMoney(input.amount);
  const toneOf = (input: { type: string }) => (input.type === 'INCOME' ? 'income' : 'expense');
  const rule = `${PAY_FREQUENCY_LABELS[values.frequency]} · ${RULES[values.rule].title.toLowerCase()}`;
  const nextPay = nextPayday ? `Next ${formatLongDate(nextPayday, { withYear: false })}` : null;
  const cycleEnd = formatLongDate(firstCycle.cycleEnd, { withYear: false });

  const monthly = (
    <>
      <span className="num font-extrabold text-expense">{formatMoney(firstCycle.monthly)}</span>{' '}
      {isDesktop ? 'a month going out' : 'a month out'}
      {firstCycle.yearly > 0 ? (
        <>
          {' '}
          + <span className="num font-extrabold">{formatMoney(firstCycle.yearly)}</span> a year
        </>
      ) : null}
    </>
  );
  const dueOneOffs = firstCycle.oneOffsDueCount;
  const comingUpSub = values.oneOffs.length
    ? isDesktop
      ? `${dueOneOffs} due this cycle`
      : `${dueOneOffs} of ${values.oneOffs.length} due this cycle`
    : isDesktop
      ? 'optional'
      : 'Optional';

  return (
    <section className="flex flex-col gap-3.5">
      {isDesktop ? (
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
            Until {cycleEnd}, after{' '}
            <span className="num text-expense">{formatMoney(firstCycle.goingOut)}</span> of payments
            due.
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-hero-bg p-5 text-hero-text">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip"
          />
          <p className="relative text-[13px] font-bold text-hero-muted">Free to spend this cycle</p>
          <p className="relative mt-1 num text-4xl font-extrabold tracking-[-0.04em]">
            {formatBalance(firstCycle.freeToSpend)}
          </p>
          <p className="relative mt-1.5 text-[13px] leading-normal text-hero-muted">
            Until {cycleEnd}, after{' '}
            <span className="num font-extrabold text-hero-text">
              {formatMoney(firstCycle.goingOut)}
            </span>{' '}
            going out
            {firstCycle.comingIn > 0 ? (
              <>
                {' '}
                and{' '}
                <span className="num font-extrabold text-hero-text">
                  +{formatMoney(firstCycle.comingIn)}
                </span>{' '}
                coming in
              </>
            ) : null}
            .
          </p>
        </div>
      )}

      <ReviewCard label="Pay" onEdit={() => goTo(0)} disabled={saving}>
        {isDesktop ? (
          <>
            <p className="text-base font-bold">{rule}</p>
            {nextPay ? <p className="text-[13px] text-muted">{nextPay}</p> : null}
            <p className="text-[13px] text-muted">
              <span className="num font-extrabold text-text">{formatMoney(income)}</span> take-home
              a month
            </p>
          </>
        ) : (
          <>
            <div className="border-t border-border px-4 py-3.5">
              <p className="text-xs text-muted">Payday</p>
              <p className="mt-0.5 text-[15px] font-bold">{rule}</p>
              {nextPay ? <p className="mt-0.5 text-xs text-muted">{nextPay}</p> : null}
            </div>
            <div className="border-t border-border px-4 py-3.5">
              <p className="text-xs text-muted">Take-home pay</p>
              <p className="mt-0.5 num text-base font-extrabold">{formatMoney(income)} a month</p>
            </div>
          </>
        )}
      </ReviewCard>

      <ReviewCard label="Your accounts" onEdit={() => goTo(1)} disabled={saving}>
        <ReviewLines
          kind="accounts"
          empty="None added"
          lines={accounts.map(account => ({
            key: account.id,
            name: account.name,
            details: account.paidInto
              ? 'Where you get paid · counts in free to spend'
              : accountDetails(account),
            amount: formatBalance(account.balance),
            tag: account.paidInto ? 'Where you get paid' : undefined
          }))}
        />
        {isDesktop ? null : (
          <p className="border-t border-border bg-surface-2 px-4 py-3 text-xs leading-normal text-muted">
            Counted in free to spend:{' '}
            <span className="num font-extrabold text-text">
              {formatBalance(firstCycle.balance)}
            </span>{' '}
            · {counted.length} {counted.length === 1 ? 'account' : 'accounts'}
          </p>
        )}
      </ReviewCard>

      <ReviewCard
        label="Regular payments"
        sub={monthly}
        onEdit={() => goTo(2)}
        disabled={saving}
        list>
        <ReviewLines
          kind="payments"
          empty={isDesktop ? 'None added' : 'Nothing added'}
          lines={values.regulars.map(regular => ({
            key: regular.id,
            name: regular.input.name,
            details: regularDetails(regular, { accounts, today }),
            amount: amountOf(regular.input),
            tone: toneOf(regular.input),
            next: regularNext(regular, { today })
          }))}
        />
      </ReviewCard>

      <ReviewCard label="Coming up" sub={comingUpSub} onEdit={() => goTo(3)} disabled={saving} list>
        <ReviewLines
          kind="payments"
          empty="Nothing added"
          lines={values.oneOffs.map(oneOff => ({
            key: oneOff.id,
            name: oneOff.input.name,
            details: oneOffDetails(oneOff, { accounts, today }),
            amount: amountOf(oneOff.input),
            tone: toneOf(oneOff.input)
          }))}
        />
      </ReviewCard>
    </section>
  );
};
