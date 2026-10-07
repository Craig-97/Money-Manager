import { ReactNode } from 'react';
import { ArrowRight, Check, Clock, Repeat, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { PaydayIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { cn } from '~/lib/cn';
import { formatDayMonth, formatLongDate } from '~/lib/dates';
import { formatBalance, formatMoney, formatPayment } from '~/lib/format';
import { FREQUENCY_LABELS, formatShortDate } from '~/lib/payments';
import { PaydayPrompt as Prompt } from '../../hooks/usePaydayPrompt';

const StepNumber = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent-text md:size-8 md:text-[13px]',
      className
    )}>
    {children}
  </span>
);

const stepTitleClasses =
  'flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.01em] md:block md:pt-[5px] md:text-base';

interface StepProps {
  number: number;
  title: string;
  // The title labels this input
  titleFor?: string;
  children: ReactNode;
}

/* A numbered step: the number sits beside the title on mobile, in its own column on desktop */
const Step = ({ number, title, titleFor, children }: StepProps) => {
  const heading = (
    <>
      <StepNumber className="md:hidden">{number}</StepNumber>
      {title}
    </>
  );
  return (
    <div className="md:grid md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4">
      <StepNumber className="hidden md:inline-flex">{number}</StepNumber>
      <div className="min-w-0">
        {titleFor ? (
          <label htmlFor={titleFor} className={stepTitleClasses}>
            {heading}
          </label>
        ) : (
          <p className={stepTitleClasses}>{heading}</p>
        )}
        {children}
      </div>
    </div>
  );
};

const lateText = (days: number) => (days === 1 ? 'yesterday' : `${days} days ago`);

/* The payday prompt: confirm the balance and start the next cycle */
export const PaydayPrompt = ({ prompt }: { prompt: Prompt }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { toReset, chosen, overdue } = prompt;
  const chosenCount = toReset.filter(item => chosen.has(item.payment.id)).length;
  const allChosen = toReset.length > 0 && chosenCount === toReset.length;
  const firstOverdue = overdue[0];

  return (
    <Dialog.Root
      open={prompt.open}
      onOpenChange={open => (open ? undefined : prompt.done ? prompt.close() : prompt.skip())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-90 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-90 flex flex-col gap-5 overflow-y-auto border border-border bg-surface outline-none md:gap-6',
            isDesktop
              ? 'top-1/2 left-1/2 max-h-[calc(100dvh-48px)] w-[min(560px,calc(100%-48px))] -translate-1/2 rounded-[28px] p-7 shadow-[0_40px_80px_-30px_var(--shadow)] data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in'
              : 'inset-x-0 bottom-0 max-h-[calc(100dvh-24px)] rounded-t-[28px] border-b-0 px-5 pt-2.5 pb-[calc(26px+env(safe-area-inset-bottom))] shadow-[0_-30px_60px_-30px_var(--shadow)] data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in'
          )}>
          {isDesktop ? null : (
            <div
              aria-hidden="true"
              className="mx-auto -mb-1 h-[5px] w-10 shrink-0 rounded-full bg-border-strong"
            />
          )}

          {prompt.done ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 px-1 pt-[18px] pb-1 text-center md:gap-3.5 md:px-2 md:pt-4">
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
              <p className="max-w-[380px] text-sm leading-[1.6] font-medium text-muted">
                Bank balance set to{' '}
                <span className="num font-bold text-text">
                  {formatBalance(prompt.resultBalance)}
                </span>
                . {prompt.resetText}
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
              <header className="flex items-start gap-3.5 md:gap-4">
                <span className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent md:size-[52px] md:rounded-[18px]">
                  <PaydayIcon size={24} className="size-[22px] md:size-6" />
                </span>
                <div className="grow md:pt-0.5">
                  <Dialog.Title className="text-2xl leading-[1.15] font-extrabold tracking-[-0.035em] md:text-[28px] md:leading-[1.1]">
                    {prompt.daysLate ? 'Start your new pay cycle' : 'It’s payday'}
                  </Dialog.Title>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-muted md:mt-1.5 md:text-sm">
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

              <Step number={1} title="Confirm your bank balance" titleFor="payday-balance">
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
                    {formatMoney(prompt.projectedBase, { whole: true })}
                  </span>{' '}
                  +{' '}
                  <span className="num font-bold text-text">
                    {formatMoney(prompt.income, { whole: true })}
                  </span>{' '}
                  income. Adjust if your bank says otherwise.
                </p>
              </Step>

              <Step number={2} title="Start a new cycle for recurring payments">
                <div className="mt-3 overflow-hidden rounded-[20px] border border-border bg-surface-2">
                  <div className="flex min-h-[52px] items-center gap-1 pr-3.5 pl-0.5 md:gap-1.5 md:pl-1">
                    <CheckboxHitArea htmlFor="payday-all">
                      <Checkbox
                        id="payday-all"
                        size="md"
                        checked={allChosen}
                        indeterminate={chosenCount > 0 && !allChosen}
                        disabled={toReset.length === 0}
                        onChange={() => prompt.setAll(!allChosen)}
                      />
                    </CheckboxHitArea>
                    <label htmlFor="payday-all" className="grow cursor-pointer text-sm font-bold">
                      Select all
                    </label>
                    <span className="rounded-full bg-accent-soft px-2.5 py-[5px] num text-xs font-bold text-accent-text">
                      {chosenCount} of {toReset.length} selected
                    </span>
                  </div>
                  {toReset.map(({ payment, next }) => (
                    <div
                      key={payment.id}
                      className="flex min-h-[60px] items-center gap-2.5 border-t border-border pr-3.5 pl-1">
                      <CheckboxHitArea htmlFor={`payday-${payment.id}`}>
                        <Checkbox
                          id={`payday-${payment.id}`}
                          size="md"
                          checked={chosen.has(payment.id)}
                          onChange={() => prompt.toggle(payment.id)}
                        />
                      </CheckboxHitArea>
                      <span
                        aria-hidden="true"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-sm font-extrabold">
                        {payment.name.charAt(0).toUpperCase()}
                      </span>
                      <label
                        htmlFor={`payday-${payment.id}`}
                        className="min-w-0 grow cursor-pointer md:pl-0">
                        <span className="block text-[15px] font-bold">{payment.name}</span>
                        <span className="mt-0.5 flex items-center gap-[5px] text-xs font-medium text-muted">
                          <Repeat
                            size={12}
                            strokeWidth={2.25}
                            className="hidden md:block"
                            aria-hidden="true"
                          />
                          {FREQUENCY_LABELS[payment.frequency]}
                          {next ? ` · next ${formatShortDate(next)}` : ' · no more payments'}
                        </span>
                      </label>
                      <span className="num text-[15px] font-extrabold text-expense">
                        {formatMoney(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-normal font-medium text-muted md:mt-2.5 md:text-[13px]">
                  Selected payments are reset to unpaid and moved to their next date.
                </p>
              </Step>

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
                        className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold whitespace-nowrap text-accent-text md:bg-accent-soft">
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

              {isDesktop ? (
                <footer className="-mx-7 -mb-1 flex items-center justify-between gap-3 border-t border-border px-7 pt-5">
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
                <footer className="flex flex-col gap-1.5">
                  <Button
                    variant="accent"
                    size="xl"
                    onClick={prompt.start}
                    loading={prompt.starting}>
                    Start new cycle
                  </Button>
                  <Button size="xl" onClick={prompt.skip} className="border-border bg-surface-2">
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
