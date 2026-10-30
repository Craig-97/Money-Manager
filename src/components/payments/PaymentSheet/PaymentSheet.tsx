import { Check, ChevronRight, FileText, PenLine, SkipForward, Undo2 } from 'lucide-react';
import { Modal } from '~/components/ui/Modal';
import { cn } from '~/lib/cn';
import { formatMoney, formatPayment } from '~/lib/format';
import { noteColor } from '~/lib/notes';
import {
  categoryLabel,
  FREQUENCY_LABELS,
  formatShortDate,
  intoText,
  movesTo
} from '~/lib/payments';
import { PaymentLetter } from '../PaymentParts';
import { SheetTile } from './components';
import { usePaymentSheet } from './usePaymentSheet';

const rowClasses =
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left text-[15px] font-bold transition-colors hover:bg-hover';

/*
 * What a payment's row opens on mobile: when it's due, its dates before payday when there's more
 * than one, its notes, and the things people do most. Edit payment opens the full form.
 */
export const PaymentSheet = () => {
  const sheet = usePaymentSheet();
  if (!sheet.payment) return null;
  const { payment, recurring, due, choices, notes, dates } = sheet;
  const urgent = due.state === 'today' || due.state === 'overdue';
  const firstNote = notes[0];

  return (
    <Modal
      open={sheet.open}
      onOpenChange={next => (next ? undefined : sheet.close())}
      title={payment.name}>
      {/* As the boards have it: the payment in a grey card, with its dates when there are several */}
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-surface-2 px-3.5 py-3">
        <PaymentLetter payment={payment} className="size-[38px] rounded-xl text-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold">
            <span className="num">{formatPayment(payment.signedAmount)}</span> ·{' '}
            <span className={cn(urgent && 'text-expense')}>
              {due.state === 'today'
                ? 'Due today'
                : due.state === 'overdue'
                  ? `Overdue · ${due.label}`
                  : due.label}
            </span>
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted">
            {recurring ? `${FREQUENCY_LABELS[recurring.frequency]} · ` : 'One-off · '}
            {intoText(payment) ?? categoryLabel(payment.category)}
            {movesTo(payment) ? ' · Not in totals' : null}
          </p>
        </div>
        {dates.length ? (
          <div className="mt-0.5 flex basis-full flex-col gap-1.5 border-t border-border pt-2.5">
            <span className="text-xs font-extrabold text-muted">
              Due {dates.length} times before payday
            </span>
            {dates.map(date => (
              <span key={date.getTime()} className="flex justify-between text-[13px] font-bold">
                <span>{formatShortDate(date, sheet.today)}</span>
                <span className="num text-expense">{formatMoney(payment.amount)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {firstNote ? (
        <button
          type="button"
          onClick={sheet.showNotes}
          aria-label={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'} on ${payment.name}`}
          className={cn(
            'flex w-full cursor-pointer flex-col gap-2 rounded-[18px] border px-4 py-3.5 text-left',
            noteColor(firstNote.color).card
          )}>
          <span className="line-clamp-2 text-sm leading-[1.45] font-semibold whitespace-pre-line">
            {firstNote.body}
          </span>
          <span className="flex w-full items-center justify-between text-xs font-bold text-muted">
            <span className="flex items-center gap-1.5">
              <FileText size={13} strokeWidth={2.25} aria-hidden="true" />
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
            <ChevronRight size={15} aria-hidden="true" />
          </span>
        </button>
      ) : null}

      {choices.pay || choices.undo || (recurring && choices.skipNext) ? (
        <div className="grid grid-cols-2 gap-2">
          {choices.pay ? (
            <SheetTile
              icon={<Check size={20} strokeWidth={2.25} />}
              label={sheet.payLabel ?? choices.pay}
              detail={sheet.payDetail}
              onClick={sheet.pay}
            />
          ) : null}
          {recurring && choices.skipNext ? (
            <SheetTile
              icon={<SkipForward size={20} />}
              label={choices.skipNext}
              onClick={sheet.skip}
            />
          ) : null}
          {choices.undo ? (
            <SheetTile icon={<Undo2 size={20} />} label={choices.undo} onClick={sheet.undo} />
          ) : null}
        </div>
      ) : null}

      <div className="-mx-1 flex flex-col">
        {recurring ? (
          <button type="button" onClick={sheet.addNote} className={rowClasses}>
            <FileText size={18} className="text-muted" aria-hidden="true" />
            <span className="flex-1">Add a note</span>
          </button>
        ) : null}
        <button type="button" onClick={sheet.edit} className={rowClasses}>
          <PenLine size={18} className="text-muted" aria-hidden="true" />
          <span className="flex-1">Edit payment</span>
          <ChevronRight size={16} className="text-muted" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
};
