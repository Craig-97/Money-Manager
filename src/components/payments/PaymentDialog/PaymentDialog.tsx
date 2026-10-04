import { Calendar, Check, ChevronRight, Repeat, SkipForward, Trash } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { AmountInput } from '~/components/form/AmountInput';
import { Checkbox } from '~/components/form/Checkbox';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { MEDIA } from '~/constants';
import { PaymentType } from '~/graphql/generated';
import { useAccount } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { cn } from '~/lib/cn';
import { daysBetween } from '~/lib/dates';
import {
  categoryLabel,
  FREQUENCIES,
  FREQUENCY_LABELS,
  formatShortDate,
  ONE_OFF_CATEGORIES,
  Payment,
  RECURRING_CATEGORIES,
  toPayments
} from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { PaymentForm, usePaymentForm } from './usePaymentForm';

const FREQUENCY_OPTIONS = FREQUENCIES.map(value => ({ value, label: FREQUENCY_LABELS[value] }));
const RECURRING_OPTIONS = RECURRING_CATEGORIES.map(value => ({
  value,
  label: categoryLabel(value)
}));
const ONE_OFF_OPTIONS = ONE_OFF_CATEGORIES.map(value => ({ value, label: categoryLabel(value) }));

const TYPES: { value: PaymentType; label: string; dot: string }[] = [
  { value: 'EXPENSE', label: 'Expense', dot: 'bg-expense' },
  { value: 'INCOME', label: 'Income', dot: 'bg-income' }
];

const choiceClasses =
  'flex min-h-[92px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-border bg-surface-2 py-[18px] pr-[18px] pl-5 text-left transition-[translate,border-color,background-color] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-hover max-md:min-h-20 max-md:gap-3.5 max-md:rounded-[22px] max-md:p-4';

/* "What kind of payment is it?" */
const Chooser = () => {
  const openAdd = usePaymentDialogStore(s => s.openAdd);
  const choices = [
    {
      kind: 'oneOff' as const,
      Icon: Calendar,
      title: 'One-off payment',
      body: 'A single expense or income on a date'
    },
    {
      kind: 'recurring' as const,
      Icon: Repeat,
      title: 'Recurring payment',
      body: 'Bills and subscriptions that repeat'
    }
  ];

  return (
    <div className="flex flex-col gap-3 pb-1">
      <p className="mb-1.5 hidden text-sm font-medium text-muted md:block">
        What kind of payment is it?
      </p>
      {choices.map(({ kind, Icon, title, body }) => (
        <button
          key={kind}
          type="button"
          onClick={() => openAdd(kind, true)}
          className={choiceClasses}>
          <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-[18px] bg-accent-soft text-accent-text max-md:size-12 max-md:rounded-2xl max-md:bg-accent max-md:text-on-accent">
            <Icon size={24} className="max-md:size-[22px]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold tracking-[-0.01em]">{title}</span>
            <span className="mt-1 block text-[13px] font-medium text-muted">{body}</span>
          </span>
          <ChevronRight
            size={18}
            strokeWidth={2.25}
            className="shrink-0 text-muted"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
};

/* Where an existing payment stands, with shortcuts to mark it paid or skip it */
const StatusStrip = ({
  payment,
  today,
  accountId
}: {
  payment: Payment;
  today: Date;
  accountId: string;
}) => {
  const { setPaid, skip } = usePaymentActions(accountId);
  const days = payment.dueDate ? daysBetween(today, payment.dueDate) : null;
  const dueText =
    days === null
      ? 'no upcoming date'
      : days === 0
        ? 'due today'
        : `due ${formatShortDate(payment.dueDate!, today)}`;
  const text =
    payment.state === 'unpaid' && days !== null && days < 0
      ? `Overdue · ${formatShortDate(payment.dueDate!, today)}`
      : `${payment.state === 'skipped' ? 'Skipped this cycle' : payment.state === 'paid' ? 'Paid' : 'Unpaid'} · ${dueText}`;
  const canSkip = payment.kind === 'recurring' && payment.state === 'unpaid' && days !== null;
  const paid = payment.state === 'paid';

  return (
    <div className="flex flex-col gap-2.5 rounded-[22px] border border-border bg-surface-2 p-3 md:flex-row md:items-center md:gap-2 md:rounded-[28px] md:py-1.5 md:pr-1.5 md:pl-[18px]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1 md:px-0">
        <span
          aria-hidden="true"
          className={cn(
            'size-2.5 shrink-0 rounded-full',
            payment.state === 'skipped' ? 'bg-accent' : paid ? 'bg-income' : 'bg-expense'
          )}
        />
        <span className="text-sm leading-[1.3] font-bold">{text}</span>
      </div>
      <div className="flex gap-2">
        {canSkip ? (
          <Button
            variant="ghost"
            onClick={() => void skip(payment)}
            className="flex-1 bg-surface-2 text-[13px] text-text max-md:border-border md:flex-none md:bg-transparent md:px-3.5 md:text-muted">
            <SkipForward size={15} aria-hidden="true" />
            Skip this cycle
          </Button>
        ) : null}
        <Button
          variant="solid"
          onClick={() => void setPaid([payment], !paid)}
          className="flex-1 text-[13px] md:flex-none md:px-3.5">
          <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          {paid ? 'Mark as unpaid' : 'Mark as paid'}
        </Button>
      </div>
    </div>
  );
};

const FormBody = ({ form, kind }: { form: PaymentForm; kind: Payment['kind'] }) => {
  const { values, set, touch, errors } = form;
  const amountField = (
    <div>
      <Label tone="muted" htmlFor="payment-amount">
        Amount
      </Label>
      <AmountInput
        id="payment-amount"
        value={values.amount}
        onChange={event => set('amount', event.target.value)}
        onBlur={() => touch('amount')}
        placeholder="0.00"
        invalid={!!errors.amount}
        aria-describedby={errors.amount ? 'payment-amount-error' : undefined}
      />
      {errors.amount ? <FieldError id="payment-amount-error">{errors.amount}</FieldError> : null}
    </div>
  );

  return (
    <>
      <div>
        <p id="payment-type" className="mb-2 text-[13px] font-bold text-muted">
          Type
        </p>
        <div
          role="group"
          aria-labelledby="payment-type"
          className="flex gap-0.5 rounded-full border border-border bg-surface-2 p-1">
          {TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              aria-pressed={values.type === type.value}
              onClick={() => set('type', type.value)}
              className="group inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-muted hover:text-text aria-pressed:bg-pill-active-bg aria-pressed:text-pill-active-text max-md:h-11 max-md:text-[13px]">
              <span
                aria-hidden="true"
                className={cn(
                  'mr-2 size-2 rounded-full bg-faint',
                  values.type === type.value && type.dot
                )}
              />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label tone="muted" htmlFor="payment-name">
          Name
        </Label>
        <TextInput
          id="payment-name"
          value={values.name}
          onChange={event => set('name', event.target.value)}
          onBlur={() => touch('name')}
          placeholder={kind === 'recurring' ? 'e.g. Spotify' : 'e.g. Concert tickets'}
          autoComplete="off"
          invalid={!!errors.name}
          aria-describedby={errors.name ? 'payment-name-error' : undefined}
        />
        {errors.name ? <FieldError id="payment-name-error">{errors.name}</FieldError> : null}
      </div>

      {kind === 'oneOff' ? (
        <div className="grid gap-3.5 max-md:grid-cols-2 max-md:gap-2.5 min-[35rem]:grid-cols-2">
          {amountField}
          <div>
            <Label tone="muted" htmlFor="payment-date">
              Due date
            </Label>
            <DatePicker
              id="payment-date"
              value={values.date}
              onChange={date => set('date', date)}
            />
          </div>
        </div>
      ) : (
        <>
          {amountField}
          <div className="grid gap-3.5 max-md:grid-cols-2 max-md:gap-2.5 min-[35rem]:grid-cols-2">
            <div>
              <Label tone="muted" htmlFor="payment-frequency">
                Repeats
              </Label>
              <Select
                id="payment-frequency"
                value={values.frequency}
                onValueChange={frequency => set('frequency', frequency)}
                options={FREQUENCY_OPTIONS}
              />
            </div>
            <div>
              <Label tone="muted" htmlFor="payment-first">
                First payment
              </Label>
              <DatePicker
                id="payment-first"
                value={values.first}
                onChange={first => set('first', first)}
              />
            </div>
          </div>
          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <Checkbox
                checked={values.hasEnd}
                onChange={event => set('hasEnd', event.target.checked)}
              />
              Ends on a set date
            </label>
            {values.hasEnd ? (
              <div className="mt-2">
                <Label tone="muted" htmlFor="payment-end">
                  Last payment
                </Label>
                <DatePicker
                  id="payment-end"
                  value={values.end}
                  onChange={end => set('end', end)}
                  min={values.first}
                  invalid={!!errors.end}
                  aria-describedby={errors.end ? 'payment-end-error' : undefined}
                />
                {errors.end ? <FieldError id="payment-end-error">{errors.end}</FieldError> : null}
              </div>
            ) : null}
          </div>
          <p
            role="status"
            className="flex items-center gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
            <Repeat size={16} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
            {form.summary}
          </p>
        </>
      )}

      <div>
        <Label tone="muted" htmlFor="payment-category">
          Category
        </Label>
        <Select
          id="payment-category"
          value={values.category}
          onValueChange={category => set('category', category)}
          options={kind === 'recurring' ? RECURRING_OPTIONS : ONE_OFF_OPTIONS}
        />
      </div>
    </>
  );
};

/*
 * Adding or editing a payment: a dialog on desktop, a bottom sheet on mobile. Lives in the app
 * shell and opens from the payment dialog store.
 */
export const PaymentDialog = () => {
  const { dialog, close, openChooser } = usePaymentDialogStore(
    useShallow(s => ({ dialog: s.dialog, close: s.close, openChooser: s.openChooser }))
  );
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { account } = useAccount();
  const { today } = usePayCycle(account?.payday);
  const { remove } = usePaymentActions(account?.id ?? '');

  const target = dialog.view === 'form' ? dialog : null;
  const kind = target?.kind ?? 'oneOff';
  const payment =
    account && target?.paymentId
      ? toPayments(account, today).find(p => p.id === target.paymentId && p.kind === kind)
      : undefined;
  const form = usePaymentForm({
    kind,
    accountId: account?.id ?? '',
    payment,
    today,
    onSaved: close,
    formKey: `${dialog.view}-${kind}-${target?.paymentId ?? 'new'}`
  });

  if (!account) return null;

  const editing = !!payment;
  const title =
    dialog.view === 'chooser'
      ? isDesktop
        ? 'Add a payment'
        : 'What are you adding?'
      : `${editing ? 'Edit' : 'Add'} ${kind === 'recurring' ? 'recurring' : 'one-off'} payment`;
  const submitLabel = editing
    ? 'Save changes'
    : kind === 'recurring' && isDesktop
      ? 'Add recurring payment'
      : 'Add payment';

  return (
    <Modal
      open={dialog.view !== 'closed' && !(target?.paymentId && !payment)}
      onOpenChange={open => (open ? undefined : close())}
      title={title}
      onBack={target?.fromChooser ? openChooser : undefined}
      backLabel="Back to payment types"
      footer={
        target ? (
          <>
            {editing ? (
              <Button
                variant="dangerGhost"
                onClick={() => {
                  void remove([payment]);
                  close();
                }}
                className="max-md:-ml-2">
                <Trash size={16} aria-hidden="true" />
                Delete
              </Button>
            ) : null}
            <span className="flex-1" />
            <Button variant="ghost" onClick={close} className="max-md:h-[52px]">
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={form.save}
              disabled={!form.canSave}
              loading={form.saving}
              className="max-md:h-[52px]">
              {submitLabel}
            </Button>
          </>
        ) : undefined
      }>
      {target ? (
        <>
          {payment ? <StatusStrip payment={payment} today={today} accountId={account.id} /> : null}
          <FormBody form={form} kind={kind} />
        </>
      ) : (
        <Chooser />
      )}
    </Modal>
  );
};
