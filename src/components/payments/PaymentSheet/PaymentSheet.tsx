import {
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  PenLine,
  PoundSterling,
  SkipForward,
  Undo2
} from 'lucide-react';
import { DebtsIcon } from '~/components/icons';
import { ActionRow } from '~/components/ui/ActionRow';
import { ActionRows } from '~/components/ui/ActionRows';
import { ActionTile } from '~/components/ui/ActionTile';
import { ActionTiles } from '~/components/ui/ActionTiles';
import { Modal } from '~/components/ui/Modal';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { noteColor } from '~/lib/notes';
import { formatShortDate } from '~/lib/payments';
import { PaymentSummary } from '../PaymentParts';
import { usePaymentSheet } from './usePaymentSheet';

/*
 * What a payment's row opens on mobile: when it's due, its dates before payday when there's more
 * than one, its notes, and the things people do most. Edit payment opens the full form.
 */
export const PaymentSheet = () => {
  const sheet = usePaymentSheet();
  if (!sheet.payment) return null;
  const { payment, recurring, due, choices, edits, notes, dates } = sheet;
  const firstNote = notes[0];

  return (
    <Modal
      open={sheet.open}
      onOpenChange={next => (next ? undefined : sheet.close())}
      title={payment.name}>
      {/* As the boards have it: the payment in a grey card, with its dates when there are several */}
      <PaymentSummary payment={payment} due={due}>
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
      </PaymentSummary>

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

      {choices.pay ||
      choices.undo ||
      edits.amount ||
      edits.date ||
      (recurring && choices.skipNext) ? (
        <ActionTiles>
          {choices.pay ? (
            <ActionTile
              icon={<Check size={20} strokeWidth={2.25} />}
              label={sheet.payLabel ?? choices.pay}
              detail={sheet.payDetail}
              onClick={sheet.pay}
            />
          ) : null}
          {edits.amount ? (
            <ActionTile
              icon={<PoundSterling size={20} />}
              label="Change amount"
              onClick={sheet.changeAmount}
            />
          ) : null}
          {edits.date ? (
            <ActionTile
              icon={<CalendarDays size={20} />}
              label="Change date"
              onClick={sheet.changeDate}
            />
          ) : null}
          {recurring && choices.skipNext ? (
            <ActionTile
              icon={<SkipForward size={20} />}
              label={choices.skipNext}
              onClick={sheet.skip}
            />
          ) : null}
          {choices.undo ? (
            <ActionTile icon={<Undo2 size={20} />} label={choices.undo} onClick={sheet.undo} />
          ) : null}
        </ActionTiles>
      ) : null}

      <ActionRows>
        {recurring ? (
          <ActionRow icon={<FileText size={18} />} onClick={sheet.addNote}>
            Add a note
          </ActionRow>
        ) : null}
        {sheet.viewDebt ? (
          <ActionRow icon={<DebtsIcon size={18} />} onClick={sheet.viewDebt} chevron>
            View debt
          </ActionRow>
        ) : null}
        <ActionRow icon={<PenLine size={18} />} onClick={sheet.edit} chevron>
          Edit payment
        </ActionRow>
      </ActionRows>
    </Modal>
  );
};
