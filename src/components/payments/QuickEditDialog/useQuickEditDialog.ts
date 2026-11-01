import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useShallow } from 'zustand/react/shallow';
import { UpdateOneOffPaymentDocument, UpdateRecurringPaymentDocument } from '~/graphql/generated';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { forFreeToSpend } from '~/lib/accounts';
import { parseIsoDate, toIsoDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoney, formatMoneyInput, parseMoney } from '~/lib/format';
import {
  dueInfo,
  earliestNewDate,
  formatShortDate,
  Payment,
  repeatsFrom,
  summarise,
  toPayments,
  withAmount,
  withDate
} from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { useQuickEditStore } from '~/state/quickEdit';
import { showToast } from '~/state/toast';

/*
 * Change amount or Change date for one payment. Either changes this payment and every one after:
 * a recurring payment's amount, or its schedule, which carries on from the new date. Before
 * saving it shows what that does to free to spend.
 */
export const useQuickEditDialog = () => {
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const { paymentId, mode, fromSheet, open, opened, close } = useQuickEditStore(
    useShallow(s => ({
      paymentId: s.paymentId,
      mode: s.mode,
      fromSheet: s.fromSheet,
      open: s.open,
      opened: s.opened,
      close: s.close
    }))
  );
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [updateOneOff] = useMutation(UpdateOneOffPaymentDocument);
  const [saving, setSaving] = useState(false);

  const payments = budget ? toPayments(budget, today) : [];
  const payment = payments.find(item => item.id === paymentId);
  const earliest = payment ? earliestNewDate(payment, today) : today;
  // Its next date, or the first it can move to when that's already been dealt with
  const startDate = payment?.dueDate && payment.dueDate >= earliest ? payment.dueDate : earliest;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  // A new opening starts from the payment as it is (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setAmount(payment ? formatMoneyInput(payment.amount) : '');
    setDate(toIsoDate(startDate));
  }

  if (!budget || !payment) return { open: false, payment: null } as const;

  const newAmount = parseMoney(amount);
  const newDate = parseIsoDate(date);
  const amountOk = newAmount !== null && newAmount > 0;
  const dateOk = !!newDate && newDate >= earliest;
  // The same amount, or its next date as it is, leaves nothing to save
  const unchanged =
    mode === 'amount'
      ? newAmount === payment.amount
      : !!payment.dueDate && date === toIsoDate(payment.dueDate);
  const changed: Payment | null =
    mode === 'amount'
      ? amountOk
        ? withAmount(payment, newAmount)
        : null
      : dateOk
        ? withDate(payment, { date: newDate, today })
        : null;

  const freeOf = (list: Payment[]) =>
    summarise({
      payments: forFreeToSpend(list),
      bankBalance: budget.bankBalance,
      monthlyIncome: budget.monthlyIncome,
      cycle,
      today
    }).freeToSpend;
  const before = freeOf(payments);
  const after = changed
    ? freeOf(payments.map(item => (item.id === payment.id ? changed : item)))
    : before;

  const recurring = payment.kind === 'recurring';
  // Only once there's a new date: before then it would describe the day it already has
  const repeats = dateOk && !unchanged ? repeatsFrom(payment, newDate) : null;

  const save = async () => {
    if (unchanged || (mode === 'amount' ? !amountOk : !dateOk)) return;
    const input =
      mode === 'amount'
        ? { amount: newAmount! }
        : recurring
          ? { firstPaymentDate: date }
          : { dueDate: date };
    setSaving(true);
    try {
      if (recurring) await updateRecurring({ variables: { id: payment.id, input } });
      else await updateOneOff({ variables: { id: payment.id, input } });
      close();
      showToast({
        message:
          mode === 'amount'
            ? `${payment.name} is now ${formatMoney(newAmount!)}`
            : repeats
              ? `${payment.name} now goes out ${repeats}, from ${formatShortDate(newDate!, today)}`
              : `${payment.name} moved to ${formatShortDate(newDate!, today)}`
      });
    } catch (error) {
      // e.g. a new date after its renewal: the API says why
      showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });
    } finally {
      setSaving(false);
    }
  };

  return {
    open,
    payment,
    mode,
    today,
    due: dueInfo(payment, { today, cycle }),
    recurring,
    amount,
    setAmount,
    amountError: amount && !amountOk ? 'Enter an amount above £0' : undefined,
    date,
    setDate,
    earliest: toIsoDate(earliest),
    // What happens from the new date: "From Fri 30 Oct, monthly on the 30th."
    dateHint: !recurring
      ? 'Changes the date of this one-off payment.'
      : repeats
        ? `From ${formatShortDate(newDate!, today)}, ${repeats}. Payments already made stay as they were.`
        : 'This payment and every one after move to the new day.',
    // Free to spend before and after, when the change moves it
    spend: after !== before ? { before, after } : null,
    canSave: !saving && !unchanged && (mode === 'amount' ? amountOk : dateOk),
    saving,
    fromSheet,
    close,
    // Back to the payment's sheet it came from on mobile
    back: () => {
      close();
      openSheet(payment.id);
    },
    save: () => void save()
  } as const;
};
