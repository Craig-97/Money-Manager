import { Trash } from 'lucide-react';
import { FormBody, usePaymentForm } from '~/components/payments/PaymentDialog';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { DEFAULT_REMINDER_SETTINGS } from '~/lib/payments';
import { SetupState } from '../../../hooks';
import { setupAccounts } from '../../../setupModel';
import { oneOffAsPayment, regularAsPayment } from '../../../setupPayments';

/*
 * The payment form, as everywhere else in the app, adding to setup's lists instead of saving.
 * Nothing is sent until setup finishes. A dialog on desktop, a sheet on mobile.
 */
export const SetupPaymentDialog = ({ setup, today }: { setup: SetupState; today: Date }) => {
  const { payment: dialog, values } = setup;
  const { target } = dialog;
  const regular = values.regulars.find(item => item.id === target.id);
  const oneOff = values.oneOffs.find(item => item.id === target.id);
  const payment =
    target.kind === 'recurring'
      ? regular && regularAsPayment(regular, { today })
      : oneOff && oneOffAsPayment(oneOff);
  const form = usePaymentForm({
    kind: target.kind,
    budgetId: '',
    payment,
    today,
    settings: DEFAULT_REMINDER_SETTINGS,
    accounts: setupAccounts(values),
    onSaved: dialog.close,
    formKey: String(dialog.opened),
    draft: dialog.save,
    start: dialog.preset
      ? { name: dialog.preset.name, category: dialog.preset.category, type: dialog.preset.type }
      : undefined
  });

  const kindName = target.kind === 'recurring' ? 'recurring payment' : 'one-off payment';
  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={payment ? `Edit ${kindName}` : `Add ${kindName}`}
      initialFocusId={payment || dialog.preset ? 'payment-amount' : 'payment-name'}
      footer={
        <>
          {payment ? (
            <Button
              variant="dangerGhost"
              onClick={() => dialog.remove(payment.id)}
              className="max-md:-ml-2">
              <Trash size={16} aria-hidden="true" />
              Remove
            </Button>
          ) : null}
          <span className="flex-1" />
          <Button variant="ghost" onClick={dialog.close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button variant="accent" onClick={form.save} className="max-md:h-[52px]">
            {payment ? 'Save' : 'Add payment'}
          </Button>
        </>
      }>
      <FormBody form={form} kind={target.kind} />
    </Modal>
  );
};
