import { Trash } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { MEDIA } from '~/constants';
import { useAccount } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { toPayments } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Chooser, FormBody, StatusStrip } from './components';
import { usePaymentForm } from './usePaymentForm';

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
  const { today, cycle } = usePayCycle(account?.payday);
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
          {payment ? (
            <StatusStrip
              payment={payment}
              today={today}
              cycle={cycle}
              accountId={account.id}
              onDone={close}
            />
          ) : null}
          <FormBody form={form} kind={kind} />
        </>
      ) : (
        <Chooser />
      )}
    </Modal>
  );
};
