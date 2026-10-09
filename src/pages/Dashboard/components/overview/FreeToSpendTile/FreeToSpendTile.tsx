import { Calendar, Check, PenLine, Plus, TriangleAlert, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { splitPence } from '../splitPence';

const chipClasses = 'flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-chip px-3.5 py-3';

/* The accent card on desktop: free to spend, and how it's worked out */
export const FreeToSpendTile = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, cycle, isEmpty, balanceEditor: editor } = dashboard;
  const openChooser = usePaymentDialogStore(s => s.openChooser);
  const [whole, pence] = splitPence(summary.freeToSpend);
  const overdrawn = summary.freeToSpend < 0;

  return (
    <article
      aria-label="Free to spend"
      className="relative flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl bg-hero-bg p-7 text-hero-text transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_var(--shadow)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[110px] -right-[90px] size-[300px] rounded-full bg-hero-chip"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[15px] font-bold text-hero-muted">Free to spend</h2>
          {overdrawn ? (
            <span
              role="status"
              className="inline-flex h-7 items-center gap-2 rounded-full bg-hero-chip px-3 text-xs font-bold">
              <TriangleAlert size={13} strokeWidth={2.25} aria-hidden="true" />
              Overdrawn
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-hero-chip px-3.5 py-2 text-[13px] font-bold">
          <Calendar size={15} strokeWidth={2.25} aria-hidden="true" />
          Until {formatShortDate(cycle.end)}
        </span>
      </div>

      <div className="relative">
        <p className="num text-[84px] leading-[0.95] font-extrabold tracking-[-0.05em]">
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        <p className="mt-3.5 text-[15px] font-semibold text-hero-muted">
          {isEmpty ? (
            'Add your payments to see what is free to spend'
          ) : overdrawn ? (
            'Nothing left to spend until payday'
          ) : (
            <>
              About{' '}
              <span className="num font-extrabold text-hero-text">
                {formatMoney(summary.perDay, { whole: true })}
              </span>{' '}
              a day for the next {summary.daysToPayday} days
            </>
          )}
        </p>
      </div>

      {isEmpty ? (
        <div className="relative mt-auto">
          <Button
            size="lg"
            onClick={openChooser}
            className="border-transparent bg-hero-text text-hero-ink hover:bg-hero-text hover:brightness-95">
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            Add a payment
          </Button>
        </div>
      ) : (
        <div
          role="group"
          aria-label="How free to spend is worked out"
          className="relative mt-auto grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)] items-stretch gap-2">
          <div className={chipClasses}>
            <div className="flex min-h-5 items-center justify-between gap-1.5">
              <span className="text-xs font-semibold text-hero-muted">Bank balance</span>
              {editor.editing ? (
                <span className="-my-1 -mr-1.5 inline-flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Save bank balance"
                    onClick={editor.commit}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full bg-hero-text text-hero-ink">
                    <Check size={15} strokeWidth={2.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel editing bank balance"
                    onClick={editor.cancel}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-hero-text hover:bg-hero-chip">
                    <X size={15} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label="Edit bank balance"
                  onClick={editor.start}
                  className="-my-3 -mr-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-hero-muted hover:bg-hero-chip hover:text-hero-text">
                  <PenLine size={16} aria-hidden="true" />
                </button>
              )}
            </div>
            {editor.editing ? (
              <>
                <div className="flex h-9 items-center gap-0.5 rounded-full border-[1.5px] border-hero-text bg-surface px-3 text-text">
                  <label
                    htmlFor="balance-edit"
                    className="num text-[15px] font-extrabold text-muted">
                    £
                  </label>
                  <input
                    id="balance-edit"
                    autoFocus
                    inputMode="decimal"
                    value={editor.draft}
                    onChange={event => editor.setDraft(event.target.value)}
                    onKeyDown={editor.onKeyDown}
                    aria-describedby="balance-edit-hint"
                    className="w-full min-w-0 flex-1 border-0 bg-transparent px-1 num text-base font-extrabold outline-none"
                  />
                </div>
                <span id="balance-edit-hint" className="sr-only">
                  Press Enter to save
                </span>
              </>
            ) : (
              <p className="num text-lg font-extrabold">{formatBalance(dashboard.bankBalance)}</p>
            )}
          </div>
          <span
            aria-hidden="true"
            className="flex items-center justify-center text-xl font-bold text-hero-muted">
            {summary.upcomingNet > 0 ? '+' : '−'}
          </span>
          <div className={chipClasses}>
            <span className="flex min-h-5 items-center text-xs font-semibold text-hero-muted">
              Payments Due
            </span>
            <p className="num text-lg font-extrabold">{formatMoney(summary.upcomingNet)}</p>
            <p className="text-xs font-medium text-hero-muted">
              {summary.unpaidCount} due before payday
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex items-center justify-center text-xl font-bold text-hero-muted">
            =
          </span>
          <div className="flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-text px-3.5 py-3 text-hero-ink">
            <span className="flex min-h-5 items-center text-xs font-bold opacity-70">
              Free to spend
            </span>
            <p className="num text-lg font-extrabold">{formatBalance(summary.freeToSpend)}</p>
          </div>
        </div>
      )}
    </article>
  );
};
