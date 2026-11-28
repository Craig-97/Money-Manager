import { FormBody, usePaymentForm } from '~/components/payments';
import { Modal, ModalActions } from '~/components/ui';
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
        <ModalActions
          remove={
            payment ? { label: 'Remove', onClick: () => dialog.remove(payment.id) } : undefined
          }
          cancel={{ onClick: dialog.close }}
          confirm={{ label: payment ? 'Save' : 'Add payment', onClick: form.save }}
        />
      }>
      <FormBody form={form} kind={target.kind} />
    </Modal>
  );
};
