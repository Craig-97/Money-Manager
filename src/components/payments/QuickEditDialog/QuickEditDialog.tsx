import { formatBalance } from '~/lib/format';
import { AmountInput, DatePicker, FieldError, FieldHint, Label } from '../../form';
import { ChangePreview, Modal, ModalActions } from '../../ui';
import { PaymentSummary } from '../PaymentParts';
import { useQuickEditDialog } from './useQuickEditDialog';

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
        <ModalActions
          cancel={{ onClick: edit.close }}
          confirm={{
            label: amount ? 'Save' : 'Change date',
            onClick: edit.save,
            disabled: !edit.canSave
          }}
        />
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
            <FieldHint>
              This payment and every one after. Payments already made keep their amount.
            </FieldHint>
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
          <FieldHint>{edit.dateHint}</FieldHint>
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
