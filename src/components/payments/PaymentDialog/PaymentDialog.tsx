import { Trash } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { MEDIA } from '~/constants';
import { useBudget } from '~/hooks/useBudget';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { toAccounts } from '~/lib/accounts';
import { DEFAULT_REMINDER_SETTINGS, toPayments } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Chooser, FormBody, StatusStrip } from './components';
import { usePaymentForm } from './usePaymentForm';

/*
 * Adding or editing a payment: a dialog on desktop, a bottom sheet on mobile. Lives in the app
 * shell and opens from the payment dialog store.
 */
export const PaymentDialog = () => {
  const { dialog, open, opened, close, openChooser } = usePaymentDialogStore(
    useShallow(s => ({
      dialog: s.dialog,
      open: s.open,
      opened: s.opened,
      close: s.close,
      openChooser: s.openChooser
    }))
  );
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const { remove } = usePaymentActions(budget?.id ?? '');

  const target = dialog.view === 'form' ? dialog : null;
  const kind = target?.kind ?? 'oneOff';
  const asDebt = target?.asDebt ?? false;
  const payment =
    budget && target?.paymentId
      ? toPayments(budget, today).find(p => p.id === target.paymentId && p.kind === kind)
      : undefined;
  const form = usePaymentForm({
    kind,
    asDebt,
    budgetId: budget?.id ?? '',
    payment,
    today,
    settings: budget?.reminderSettings ?? DEFAULT_REMINDER_SETTINGS,
    accounts: toAccounts(budget?.accounts, today),
    onSaved: close,
    // Each opening starts afresh. Closing keeps the form as it was while the dialog animates away.
    formKey: String(opened)
  });

  if (!budget) return null;

  // From what was opened, so it reads the same while closing, even once the payment is deleted
  const editing = !!target?.paymentId;
  const title =
    dialog.view === 'chooser'
      ? isDesktop
        ? 'Add a payment'
        : 'What are you adding?'
      : asDebt
        ? `${editing ? 'Edit' : 'Add a'} debt`
        : `${editing ? 'Edit' : 'Add'} ${kind === 'recurring' ? 'recurring' : 'one-off'} payment`;
  const submitLabel = editing ? 'Save changes' : asDebt ? 'Add debt' : 'Add payment';

  return (
    <Modal
      // A payment that's gone has nothing to edit
      open={open && !(target?.paymentId && !payment)}
      onOpenChange={open => (open ? undefined : close())}
      title={title}
      onBack={target?.fromChooser ? openChooser : undefined}
      backLabel="Back to payment types"
      initialFocusId={target?.focusBalance ? 'payment-balance' : undefined}
      footer={
        target ? (
          <>
            {editing ? (
              <Button
                variant="dangerGhost"
                onClick={() => {
                  if (payment) void remove([payment]);
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
          {payment ? (
            <StatusStrip payment={payment} today={today} cycle={cycle} budgetId={budget.id} />
          ) : null}
          <FormBody form={form} kind={kind} />
        </>
      ) : (
        <Chooser />
      )}
    </Modal>
  );
};
