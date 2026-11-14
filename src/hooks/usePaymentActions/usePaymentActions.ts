import { useMutation } from '@apollo/client/react';
import { removeFromBudget } from '~/graphql/cache';
import {
  BatchDeleteOneOffPaymentsDocument,
  BatchDeleteRecurringPaymentsDocument,
  MarkPaymentsPaidDocument,
  MarkPaymentsUnpaidDocument,
  SkipRecurringPaymentsDocument
} from '~/graphql/generated';
import { formatShortDate, startOfToday, toApiDate } from '~/lib/dates';
import { formatMoney, roundPence } from '~/lib/format';
import { Payment, RecurringPayment, repeatsInCycle } from '~/lib/payments';
import { showErrorToast, showToast } from '~/state/toast';

const idsOf = (payments: readonly Payment[], kind: Payment['kind']) =>
  payments.filter(payment => payment.kind === kind).map(payment => payment.id);

// "Netflix" for one payment, "3 payments" for more
const describe = (payments: readonly Payment[]) =>
  payments.length === 1 ? payments[0].name : `${payments.length} payments`;

/* "· £20.00 off your balance" for a single payment, so it's clear where the money went */
const balanceNote = (payments: readonly Payment[], paid: boolean) => {
  if (payments.length !== 1) return '';
  const [payment] = payments;
  const off = paid === (payment.type === 'EXPENSE');
  return ` · ${formatMoney(payment.amount)} ${off ? 'off' : 'added to'} your balance`;
};

/*
 * "· £203.60 off what you owe, after £41.40 interest": what paying a debt did to it, from its
 * balance before and after. Interest built up since the last payment goes on first.
 */
const debtNote = (payment: Payment, balanceAfter: number | undefined) => {
  if (payment.kind !== 'recurring' || !payment.debt || balanceAfter === undefined) return '';
  const change = roundPence(payment.debt.balance - balanceAfter);
  const interest = roundPence(payment.amount - change);
  const moved = `${formatMoney(Math.abs(change))} ${change >= 0 ? 'off' : 'added to'} what you owe`;
  return ` · ${moved}${interest > 0 ? `, after ${formatMoney(interest)} interest` : ''}`;
};

/* Paying, skipping and deleting payments, with a toast to say it's done */
export const usePaymentActions = (budgetId: string) => {
  const [markPaid] = useMutation(MarkPaymentsPaidDocument);
  const [markUnpaid] = useMutation(MarkPaymentsUnpaidDocument);
  const [skipRecurring] = useMutation(SkipRecurringPaymentsDocument);
  const [deleteRecurring] = useMutation(BatchDeleteRecurringPaymentsDocument);
  const [deleteOneOffs] = useMutation(BatchDeleteOneOffPaymentsDocument);

  /*
   * Marks payments paid, taking them off the bank balance: a recurring payment has its next date
   * paid and moves on to the one after, and a one-off is marked paid until payday, so it can be
   * undone. One-offs already paid are left out.
   */
  const pay = async (all: readonly Payment[]) => {
    const payments = all.filter(payment => payment.kind === 'recurring' || !payment.paidAt);
    if (!payments.length) return;
    try {
      const { data } = await markPaid({
        variables: {
          input: {
            budgetId,
            recurringPaymentIds: idsOf(payments, 'recurring'),
            oneOffPaymentIds: idsOf(payments, 'oneOff')
          }
        }
      });
      // A debt that payment cleared offers to go, as there's nothing left to pay
      const after = data?.markPaymentsPaid.budget?.recurringPayments ?? [];
      const cleared = payments.filter(
        payment =>
          payment.kind === 'recurring' &&
          payment.debt &&
          after.find(updated => updated?.id === payment.id)?.debt?.balance === 0
      );
      if (cleared.length === 1) showPaidOff(cleared[0]);
      else {
        const single = payments.length === 1 ? payments[0] : null;
        const debt = single
          ? debtNote(single, after.find(updated => updated?.id === single.id)?.debt?.balance)
          : '';
        showToast({
          message: `${describe(payments)} marked as paid${balanceNote(payments, true)}${debt}`
        });
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  /*
   * Undoes a recurring payment's latest pay or skip this cycle, bringing those dates back, or makes
   * a paid one-off unpaid. Whatever paying took off the balance goes back on.
   */
  const undo = async (payment: Payment) => {
    const wasPaid =
      payment.kind === 'oneOff'
        ? Boolean(payment.paidAt)
        : payment.thisCycle.at(-1)?.kind === 'paid';
    if (payment.kind === 'oneOff' ? !payment.paidAt : !payment.thisCycle.length) return;
    try {
      await markUnpaid({
        variables: {
          input: {
            budgetId,
            recurringPaymentIds: payment.kind === 'recurring' ? [payment.id] : [],
            oneOffPaymentIds: payment.kind === 'oneOff' ? [payment.id] : []
          }
        }
      });
      showToast({
        message: wasPaid
          ? `${payment.name} marked as unpaid${balanceNote([payment], false)}`
          : `${payment.name} is no longer skipped`
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  /*
   * Skips a recurring payment's next date, or every date before `until` (the next payday) to skip
   * the rest of the cycle. The balance doesn't change.
   */
  const skip = async (payment: RecurringPayment, until?: Date) => {
    try {
      await skipRecurring({
        variables: {
          input: {
            budgetId,
            recurringPaymentIds: [payment.id],
            until: until ? toApiDate(until) : undefined
          }
        }
      });
      const skipped = until
        ? 'for the rest of this cycle'
        : repeatsInCycle(payment) && payment.dueDate
          ? `for ${formatShortDate(payment.dueDate, startOfToday())}`
          : 'this cycle';
      // A debt's interest doesn't stop for a skipped payment
      showToast({
        message: `${payment.name} skipped ${skipped}${payment.debt ? ' · its interest still builds up until the next payment' : ''}`
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  const remove = async (payments: readonly Payment[]) => {
    if (!payments.length) return;
    const recurring = idsOf(payments, 'recurring');
    const oneOffs = idsOf(payments, 'oneOff');
    try {
      await Promise.all([
        recurring.length
          ? deleteRecurring({
              variables: { ids: recurring },
              update: cache =>
                removeFromBudget(cache, {
                  budget: budgetId,
                  field: 'recurringPayments',
                  ids: recurring
                })
            })
          : null,
        oneOffs.length
          ? deleteOneOffs({
              variables: { ids: oneOffs },
              update: cache =>
                removeFromBudget(cache, {
                  budget: budgetId,
                  field: 'oneOffPayments',
                  ids: oneOffs
                })
            })
          : null
      ]);
      showToast({ message: `Deleted ${describe(payments)}` });
    } catch (error) {
      showErrorToast(error);
    }
  };

  /* A debt's been paid off: say so, and offer to delete it as there's nothing left to pay */
  const showPaidOff = (payment: Payment) =>
    showToast({
      message: `${payment.name} is paid off`,
      action: { label: 'Delete', onClick: () => void remove([payment]) }
    });

  return { pay, undo, skip, remove, showPaidOff };
};

export type PaymentActions = ReturnType<typeof usePaymentActions>;
