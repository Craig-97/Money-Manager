import { Fragment } from 'react';
import { ArrowRight, Check, Clock, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { PaydayIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { footerShade, headerShade, scrollBodyClasses } from '~/components/ui/Modal';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useScrollShade } from '~/hooks/useScrollShade';
import { cn } from '~/lib/cn';
import { formatDayMonth, formatLongDate } from '~/lib/dates';
import { formatBalance, formatMoney, formatPayment } from '~/lib/format';
import { PaydayPrompt as Prompt } from '../../../hooks/usePaydayPrompt';
import { GoneOutCheck } from '../GoneOutCheck';
import { SavingsCheck } from '../SavingsCheck';
import { Step } from '../Step';
import { StepNumber } from '../StepNumber';

const lateText = (days: number) => (days === 1 ? 'yesterday' : `${days} days ago`);

/*
 * The payday prompt: check what's gone out, confirm the balance and start the next cycle. The
 * header and buttons stay put while the steps scroll between them.
 */
export const PaydayPrompt = ({ prompt }: { prompt: Prompt }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { ref: bodyRef, top: shadeTop, bottom: shadeBottom } = useScrollShade();
  const { overdue } = prompt;
  const firstOverdue = overdue[0];
  const hasCheck = prompt.leftOver.length > 0 || prompt.dueSince.length > 0;

  return (
    <Dialog.Root
      open={prompt.open}
      onOpenChange={open => (open ? undefined : prompt.done ? prompt.close() : prompt.skip())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-90 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-90 flex flex-col overflow-hidden border border-border bg-surface outline-none',
            isDesktop
              ? 'top-1/2 left-1/2 max-h-[calc(100dvh-48px)] w-[min(560px,calc(100%-48px))] -translate-1/2 rounded-[28px] shadow-[0_40px_80px_-30px_var(--shadow)] data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in'
              : 'inset-x-0 bottom-0 max-h-[calc(100dvh-24px)] rounded-t-[28px] border-b-0 pt-2.5 shadow-[0_-30px_60px_-30px_var(--shadow)] data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in'
          )}>
          {isDesktop ? null : (
            <div
              aria-hidden="true"
              className="mx-auto mb-1.5 h-[5px] w-10 shrink-0 rounded-full bg-border-strong"
            />
          )}

          {prompt.done ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 px-6 pt-[18px] pb-[calc(26px+env(safe-area-inset-bottom))] text-center md:gap-3.5 md:p-7 md:pt-11">
              <span className="inline-flex size-[60px] items-center justify-center rounded-full bg-accent text-on-accent md:size-16">
                <Check
                  size={30}
                  strokeWidth={2.5}
                  className="size-7 md:size-[30px]"
                  aria-hidden="true"
                />
              </span>
              <Dialog.Title className="mt-1 text-2xl font-extrabold tracking-[-0.03em] md:text-[26px]">
                New cycle started
              </Dialog.Title>
              <p className="max-w-[400px] text-sm leading-[1.6] font-medium text-muted">
                {prompt.paidIntoName} set to{' '}
                <span className="num font-bold text-text">
                  {formatBalance(prompt.resultBalance)}
                </span>
                .{prompt.resultText ? ` ${prompt.resultText}` : ''}
              </p>
              <Button
                variant="accent"
                size="xl"
                onClick={prompt.close}
                className="mt-2 w-full md:h-11 md:w-auto md:px-[18px] md:text-sm">
                Back to dashboard
              </Button>
            </div>
          ) : (
            <>
              <header
                className={cn(
                  'flex shrink-0 items-start gap-3.5 px-5 pt-1.5 pb-3.5 md:gap-4 md:px-7 md:pt-7 md:pb-4',
                  headerShade(shadeTop)
                )}>
                <span className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent md:size-[52px] md:rounded-[18px]">
                  <PaydayIcon size={24} className="size-[22px] md:size-6" />
                </span>
                <div className="grow md:pt-0.5">
                  <Dialog.Title className="text-2xl leading-[1.15] font-extrabold tracking-[-0.035em] md:text-[28px] md:leading-[1.1]">
                    {prompt.daysLate ? 'Start your new pay cycle' : 'It’s payday'}
                  </Dialog.Title>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-muted md:mt-1.5 md:text-sm">
                    {prompt.daysLate
                      ? `Payday was ${formatLongDate(prompt.payday, { withYear: false })} · ${lateText(prompt.daysLate)}`
                      : formatLongDate(prompt.payday, { withYear: false })}
                    <span
                      aria-hidden="true"
                      className="hidden size-1 rounded-full bg-border-strong md:inline-block"
                    />
                    <span className="md:hidden">·</span>
                    <span className="num font-bold text-income">
                      {formatPayment(prompt.income)}
                      <span className="hidden md:inline"> income</span>
                    </span>
                  </p>
                </div>
                <IconButton
                  aria-label="Close payday prompt"
                  onClick={prompt.skip}
                  className="-mt-1.5 -mr-2.5 md:-mr-2">
                  <X size={20} strokeWidth={2.25} aria-hidden="true" />
                </IconButton>
              </header>

              <div
                ref={bodyRef}
                className={cn(
                  'flex flex-col gap-[22px] px-5 pt-4 pb-5 md:gap-6 md:px-7 md:pt-5 md:pb-6',
                  scrollBodyClasses
                )}>
                {hasCheck ? <GoneOutCheck prompt={prompt} /> : null}

                <Step
                  number={hasCheck ? 2 : 1}
                  title={`Confirm ${prompt.paidIntoName === 'Current account' ? 'your current account' : prompt.paidIntoName}`}
                  subtitle="Where you get paid"
                  titleFor="payday-balance">
                  <div className="mt-3 flex h-[60px] items-center gap-1.5 rounded-[18px] border-[1.5px] border-border-strong bg-surface-2 px-[18px] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
                    <span
                      aria-hidden="true"
                      className="num text-2xl font-extrabold text-muted md:text-[26px]">
                      £
                    </span>
                    <input
                      id="payday-balance"
                      inputMode="decimal"
                      value={prompt.balance}
                      onChange={event => prompt.setBalance(event.target.value)}
                      aria-describedby="payday-balance-help"
                      className="w-full min-w-0 flex-1 border-0 bg-transparent p-0 num text-2xl leading-none font-extrabold tracking-[-0.03em] text-text outline-none md:text-[26px]"
                    />
                    <span className="rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap text-muted md:text-xs">
                      {prompt.edited ? 'Edited' : 'Projected'}
                    </span>
                  </div>
                  <p
                    id="payday-balance-help"
                    className="mt-2 text-xs leading-normal font-medium text-muted md:mt-2.5 md:text-[13px]">
                    Projected:{' '}
                    <span className="num font-bold text-text">
                      {formatBalance(prompt.parts.start)}
                    </span>{' '}
                    + <span className="num font-bold text-text">{formatMoney(prompt.income)}</span>{' '}
                    pay
                    {prompt.parts.changes.map(change => (
                      <Fragment key={change.label}>
                        {' '}
                        {change.amount < 0 ? '−' : '+'}{' '}
                        <span className="num font-bold text-text">
                          {formatMoney(change.amount)}
                        </span>{' '}
                        {change.label}
                      </Fragment>
                    ))}
                    . Adjust if your bank says otherwise.
                  </p>
                </Step>

                {prompt.savings.rows.length ? (
                  <SavingsCheck prompt={prompt} number={hasCheck ? 3 : 2} />
                ) : null}

                {firstOverdue && firstOverdue.dueDate ? (
                  <div className="flex items-center gap-3 rounded-[18px] border border-border bg-surface-2 py-3 pr-3 pl-3.5 md:grid md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4 md:border-0 md:bg-transparent md:p-0">
                    <StepNumber className="size-8 bg-expense-bg text-expense">
                      <Clock size={16} strokeWidth={2.25} aria-hidden="true" />
                    </StepNumber>
                    <div className="flex min-w-0 grow items-center justify-between gap-3 md:flex-wrap">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold md:text-sm">
                          {overdue.length} one-off{' '}
                          {overdue.length === 1 ? 'payment is' : 'payments are'} overdue
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-muted md:mt-[3px] md:text-[13px]">
                          {firstOverdue.name} ·{' '}
                          <span className="num font-bold text-expense">
                            {formatMoney(firstOverdue.amount)}
                          </span>{' '}
                          · {formatDayMonth(firstOverdue.dueDate)}
                          {overdue.length > 1 ? ` and ${overdue.length - 1} more` : ''}
                        </p>
                      </div>
                      {prompt.overduePaid ? (
                        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-income-bg px-3 text-xs font-bold text-income md:h-9 md:px-3.5 md:text-[13px]">
                          <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                          {isDesktop ? 'Marked as paid' : 'Paid'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void prompt.payOverdue()}
                          className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-soft px-3.5 text-[13px] font-bold whitespace-nowrap text-accent-text">
                          <Check
                            size={15}
                            strokeWidth={2.5}
                            className="hidden md:block"
                            aria-hidden="true"
                          />
                          Mark as paid
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {isDesktop ? (
                <footer
                  className={cn(
                    'flex shrink-0 items-center justify-between gap-3 bg-surface px-7 pt-5 pb-6',
                    footerShade(shadeBottom)
                  )}>
                  <span className="text-xs font-medium text-muted">
                    You can change your payday in Profile.
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={prompt.skip}>
                      Skip for now
                    </Button>
                    <Button variant="accent" onClick={prompt.start} loading={prompt.starting}>
                      Start new cycle
                      <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
                    </Button>
                  </div>
                </footer>
              ) : (
                <footer
                  className={cn(
                    'flex shrink-0 flex-col gap-1.5 bg-surface px-5 pt-3 pb-[calc(22px+env(safe-area-inset-bottom))]',
                    footerShade(shadeBottom)
                  )}>
                  <Button
                    variant="accent"
                    size="xl"
                    onClick={prompt.start}
                    loading={prompt.starting}>
                    Start new cycle
                  </Button>
                  <Button variant="ghost" size="xl" onClick={prompt.skip}>
                    Skip for now
                  </Button>
                </footer>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
