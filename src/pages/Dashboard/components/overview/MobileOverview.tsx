import { ReactNode } from 'react';
import { Calendar, Check, PenLine, Plus, Repeat, TriangleAlert, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney, formatPayment } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { CycleBar } from './CycleBar';
import { splitPence } from './FreeToSpendTile';
import { IncomeEditor } from './IncomeEditor';
import { IncomeSplit } from './MonthlyStats';
import { OverdrawnPill } from './NextPaydayTile';
import { Dashboard } from '../../hooks';
import { PaydayOverrideDialog } from '../payday/PaydayPicker';

const heroEditClasses =
  '-my-3 -mr-3 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-hero-muted hover:bg-hero-chip hover:text-hero-text';

/* Mobile: the accent card, with the sum behind free to spend and the cycle bar */
export const MobileHero = ({ dashboard }: { dashboard: Dashboard }) => {
  const {
    summary,
    cycle,
    days,
    isEmpty,
    bankBalance,
    balanceEditor: editor,
    paydayOverride: override
  } = dashboard;
  const openChooser = usePaymentDialogStore(s => s.openChooser);
  const [whole, pence] = splitPence(summary.freeToSpend);

  return (
    <article
      aria-label="Free to spend"
      className="flex flex-col gap-4 rounded-3xl bg-hero-bg p-[22px] text-hero-text">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-hero-muted">Free to spend</h2>
        {override.canChange ? (
          <button
            type="button"
            aria-label={`${summary.daysToPayday} days, ${formatShortDate(cycle.end)}. Change this payday`}
            onClick={() => override.setOpen(true)}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-bold',
              override.moved ? 'bg-hero-text text-hero-ink' : 'bg-hero-chip'
            )}>
            {summary.daysToPayday} days · {formatShortDate(cycle.end)}
            <PenLine size={13} strokeWidth={2.25} aria-hidden="true" />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hero-chip px-[11px] py-[7px] text-xs font-bold">
            <Calendar size={13} strokeWidth={2.25} aria-hidden="true" />
            {summary.daysToPayday} days · {formatShortDate(cycle.end)}
          </span>
        )}
      </div>
      <div>
        <p className="num text-[56px] leading-none font-extrabold tracking-[-0.05em]">
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        {isEmpty ? (
          <>
            <p className="mt-2.5 text-[13px] font-semibold text-hero-muted">
              Add your payments to see what is free to spend
            </p>
            <Button
              onClick={openChooser}
              className="mt-3.5 border-transparent bg-hero-text text-hero-bg hover:bg-hero-text">
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Add a payment
            </Button>
          </>
        ) : summary.freeToSpend < 0 ? (
          <span
            role="status"
            className="mt-2.5 inline-flex h-5 items-center gap-1.5 rounded-full bg-hero-chip px-2.5 text-[11px] font-bold">
            <TriangleAlert size={14} strokeWidth={2.25} aria-hidden="true" />
            Overdrawn before payday
          </span>
        ) : (
          <p className="mt-2.5 text-[13px] font-semibold text-hero-muted">
            About{' '}
            <span className="num font-extrabold text-hero-text">
              {formatMoney(summary.perDay, { whole: true })}
            </span>{' '}
            a day until payday
          </p>
        )}
      </div>

      <div className="rounded-[18px] bg-hero-chip px-3.5 py-1.5 text-[13px] font-semibold">
        {editor.editing ? (
          <div className="pt-2 pb-1.5">
            <label htmlFor="balance-edit-mobile" className="text-hero-muted">
              Bank balance
            </label>
            <div className="my-1 flex h-[52px] items-center gap-0.5 rounded-full border-[1.5px] border-hero-text pr-1 pl-3.5">
              <span aria-hidden="true" className="num text-lg font-extrabold text-hero-muted">
                £
              </span>
              <input
                id="balance-edit-mobile"
                autoFocus
                inputMode="decimal"
                value={editor.draft}
                onChange={event => editor.setDraft(event.target.value)}
                onKeyDown={editor.onKeyDown}
                aria-describedby="balance-edit-mobile-hint"
                className="w-full min-w-0 flex-1 border-0 bg-transparent px-1 num text-lg leading-none font-extrabold tracking-[-0.03em] text-hero-text outline-none"
              />
              <button
                type="button"
                aria-label="Save bank balance"
                onClick={editor.commit}
                className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-hero-text text-hero-bg">
                <Check size={17} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Cancel editing bank balance"
                onClick={editor.cancel}
                className={cn(heroEditClasses, 'm-0')}>
                <X size={17} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
            <p id="balance-edit-mobile-hint" className="text-xs font-medium text-hero-muted">
              Press Enter to save
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 py-2">
            <span className="text-hero-muted">Bank balance</span>
            <span className="inline-flex items-center gap-1">
              <span className="num font-extrabold">{formatBalance(bankBalance)}</span>
              <button
                type="button"
                aria-label="Edit bank balance"
                onClick={editor.start}
                className={heroEditClasses}>
                <PenLine size={15} aria-hidden="true" />
              </button>
            </span>
          </div>
        )}
        {isEmpty ? null : (
          <>
            <div className="flex justify-between py-2">
              <span className="text-hero-muted">{summary.unpaidCount} due before payday</span>
              <span className="num font-extrabold">{formatPayment(summary.upcomingNet)}</span>
            </div>
            <div className="flex justify-between border-t border-hero-chip pt-2.5 pb-2">
              <span className="font-bold">Free to spend</span>
              <span className="num font-extrabold">{formatBalance(summary.freeToSpend)}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5 rounded-[18px] bg-black/24 px-3.5 pt-3 pb-2.5">
        <CycleBar days={days} tone="hero" className="-mt-2.5 -mb-2" />
        <div className="flex justify-between text-[11px] font-semibold text-hero-muted">
          <span>Paid {formatShortDate(cycle.start)}</span>
          <span>
            Payday {formatShortDate(cycle.end)}
            {override.moved ? ` · usual ${formatShortDate(override.usual)}` : ''}
          </span>
        </div>
      </div>
      {override.canChange ? <PaydayOverrideDialog override={override} /> : null}
    </article>
  );
};

interface FigureRowProps {
  label: ReactNode;
  value: ReactNode;
  aside?: ReactNode;
  last?: boolean;
}

const FigureRow = ({ label, value, aside, last }: FigureRowProps) => (
  <div className={cn('py-3.5', !last && 'border-b border-border')}>
    <div className="flex min-h-11 items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-muted">{label}</p>
        <p className="mt-0.5 num text-2xl font-extrabold">{value}</p>
      </div>
      {aside ? (
        <div className="shrink-0 text-right text-xs font-medium text-muted">{aside}</div>
      ) : null}
    </div>
  </div>
);

/* Mobile: payday balance, after recurring, income and recurring as a list */
export const MobileFigures = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, cycle, isEmpty, monthlyIncome, incomeEditor: editor } = dashboard;
  const openAdd = usePaymentDialogStore(s => s.openAdd);
  const averaged = summary.averagedRecurring.length > 0;

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-surface px-5 py-2">
      {isEmpty ? (
        <div className="flex flex-col items-start gap-2.5 border-b border-border py-3.5">
          <p className="text-[13px] font-medium text-muted">
            Add your income and payments to see your balance on payday
          </p>
          <Button variant="accent" onClick={() => openAdd('recurring')}>
            <Repeat size={16} strokeWidth={2.25} aria-hidden="true" />
            Add recurring payment
          </Button>
        </div>
      ) : (
        <>
          <FigureRow
            label={
              <>
                Payday balance
                {summary.onPayday < 0 ? <OverdrawnPill /> : null}
              </>
            }
            value={
              <span className={cn(summary.onPayday < 0 && 'text-expense')}>
                {formatBalance(summary.onPayday)}
              </span>
            }
            aside={formatShortDate(cycle.end)}
          />
          <FigureRow
            label={
              <>
                After recurring
                {summary.afterRecurring < 0 ? <OverdrawnPill /> : null}
              </>
            }
            value={
              <span className={cn(summary.afterRecurring < 0 && 'text-expense')}>
                {formatBalance(summary.afterRecurring)}
              </span>
            }
            aside={
              <>
                Once bills
                <br />
                are paid
              </>
            }
          />
        </>
      )}
      <div className="border-b border-border py-3.5">
        <div className="-mr-2.5 flex min-h-11 items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-muted">Monthly income</p>
            {editor.editing ? null : (
              <p className="mt-0.5 num text-2xl font-extrabold">{formatMoney(monthlyIncome)}</p>
            )}
          </div>
          {editor.editing ? null : (
            <IconButton aria-label="Edit monthly income" onClick={editor.start}>
              <PenLine size={18} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {editor.editing ? (
          <div className="mt-2 flex flex-col gap-2.5">
            <IncomeEditor editor={editor} id="income-edit-mobile" />
          </div>
        ) : null}
      </div>
      <FigureRow
        last
        label="Monthly recurring"
        value={
          <>
            {averaged ? (
              <span className="text-muted">
                <span aria-hidden="true">≈</span>
                <span className="sr-only">About</span>{' '}
              </span>
            ) : null}
            {(summary.monthlyRecurring < 0 ? '+' : '') + formatMoney(summary.monthlyRecurring)}
          </>
        }
        aside={
          summary.annualRecurring > 0 ? (
            <>
              +{' '}
              <span className="num font-bold text-text">
                {formatMoney(summary.annualRecurring)}
              </span>
              <br />
              /yr annual
            </>
          ) : null
        }
      />
    </article>
  );
};

/* Mobile: what's left of income after recurring payments */
export const MobileDiscretionary = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, isEmpty } = dashboard;
  const overspent = summary.discretionary < 0;

  return (
    <article className="flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="flex flex-wrap items-center gap-2 text-base font-extrabold tracking-[-0.02em]">
          Discretionary income
          {overspent ? <OverdrawnPill>Overspent</OverdrawnPill> : null}
        </h2>
        <p className="text-xs font-semibold whitespace-nowrap text-muted">
          <span
            className={cn(
              'num text-lg font-extrabold',
              overspent ? 'text-expense' : 'text-accent-text'
            )}>
            {formatBalance(summary.discretionary)}
          </span>{' '}
          /mo
        </p>
      </div>
      {isEmpty ? (
        <p className="text-[13px] font-medium text-muted">Shown once you add income and payments</p>
      ) : (
        <IncomeSplit share={summary.recurringShare} compact />
      )}
    </article>
  );
};
