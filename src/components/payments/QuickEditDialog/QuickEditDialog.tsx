import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { ChangePreview } from '~/components/ui/ChangePreview';
import { Modal } from '~/components/ui/Modal';
import { formatBalance } from '~/lib/format';
import { PaymentSummary } from '../PaymentParts';
import { useQuickEditDialog } from './useQuickEditDialog';

const hintClasses = 'mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted';

/*
 * Change amount or Change date: a small dialog on desktop, a sheet on mobile, for this payment
 * and every one after. Edit payment has everything else.
 */
export const QuickEditDialog = () => {
  const edit = useQuickEditDialog();
  if (!edit.payment) return null;
  const { payment } = edit;
  const amount = edit.mode === 'amount';

  return (
    <Modal
      open={edit.open}
      onOpenChange={next => (next ? undefined : edit.close())}
      title={amount ? 'Change amount' : 'Change date'}
      onBack={edit.fromSheet ? edit.back : undefined}
      backLabel={`Back to ${payment.name}`}
      initialFocusId={amount ? 'quick-amount' : undefined}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={edit.close}>
            Cancel
          </Button>
          <Button variant="accent" onClick={edit.save} disabled={!edit.canSave}>
            {amount ? 'Save' : 'Change date'}
          </Button>
        </>
      }>
      <PaymentSummary payment={payment} due={edit.due} named />

      {amount ? (
        <div>
          <Label tone="muted" htmlFor="quick-amount">
            New amount
          </Label>
          <AmountInput
            id="quick-amount"
            value={edit.amount}
            onChange={event => edit.setAmount(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') edit.save();
            }}
            placeholder="0.00"
            invalid={!!edit.amountError}
            aria-describedby={edit.amountError ? 'quick-amount-error' : undefined}
          />
          {edit.amountError ? (
            <FieldError id="quick-amount-error">{edit.amountError}</FieldError>
          ) : edit.recurring ? (
            <p className={hintClasses}>
              This payment and every one after. Payments already made keep their amount.
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <Label tone="muted" htmlFor="quick-date">
            New date
          </Label>
          <DatePicker
            id="quick-date"
            value={edit.date}
            onChange={edit.setDate}
            min={edit.earliest}
          />
          <p className={hintClasses}>{edit.dateHint}</p>
        </div>
      )}

      {edit.spend ? (
        <ChangePreview
          label="Free to spend"
          before={formatBalance(edit.spend.before)}
          after={formatBalance(edit.spend.after)}
        />
      ) : null}
    </Modal>
  );
};
