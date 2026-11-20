import { useShallow } from 'zustand/react/shallow';
import { PaymentHistoryDocument } from '~/graphql/generated';
import { useBudget } from '~/hooks/useBudget';
import { useDebtActions } from '~/hooks/useDebtActions';
import { useHistoryByYear } from '~/hooks/useHistoryByYear';
import { usePayCycle } from '~/hooks/usePayCycle';
import { hasSeveralSpending, toAccounts } from '~/lib/accounts';
import { isDebt, paidOffShare, startedAt } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { yearPaging } from '~/lib/paging';
import {
  byMonth,
  HistoryEntry,
  historySummary,
  isRecurring,
  paymentHistory,
  toPayments
} from '~/lib/payments';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useDebtViewStore } from '~/state/debtView';
import { usePaymentHistoryStore } from '~/state/paymentHistory';
import { usePaymentSheetStore } from '~/state/paymentSheet';

/*
 * The recurring payment See payments opened, a year of its history, and what it adds up to. A
 * debt's says what's left; any other's, what the year came to. Back goes to the view it came from.
 */
export const usePaymentsDialog = () => {
  const { budget } = useBudget();
  const { today, holidays } = usePayCycle(budget?.payday);
  const { paymentId, open, backTo, close } = usePaymentHistoryStore(
    useShallow(s => ({ paymentId: s.paymentId, open: s.open, backTo: s.backTo, close: s.close }))
  );
  const openDebt = useDebtViewStore(s => s.openFor);
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const openOverpayment = useDebtDialogStore(s => s.openOverpayment);
  const actions = useDebtActions(budget?.id ?? '');
  // Kept while closing, so it animates away showing what it showed
  const payment = budget
    ? toPayments(budget, { today, holidays })
        .filter(isRecurring)
        .find(item => item.id === paymentId)
    : undefined;
  const history = useHistoryByYear(PaymentHistoryDocument, {
    id: payment?.id,
    today,
    select: data => data.recurringPayment
  });
  if (!payment) return null;

  const accounts = toAccounts(budget?.accounts, today);
  // The From column only says something once there's more than one account to spend from
  const several = hasSeveralSpending(accounts);
  const accountName = (id: string) =>
    several ? (accounts.find(account => account.id === id)?.name ?? null) : null;
  const options = { today, accountName };
  // The newest year leads with the next one due
  const entries = history.records
    ? paymentHistory(payment, {
        ...options,
        records: history.records,
        next: history.year === history.years[0]
      })
    : [];
  const older = history.older.flatMap(({ records }) =>
    paymentHistory(payment, { ...options, records, next: false })
  );
  const debt = isDebt(payment) ? payment : null;
  const back = backTo
    ? () => {
        close();
        if (backTo === 'debt') openDebt(payment.id);
        else openSheet(payment.id);
      }
    : undefined;

  return {
    open,
    payment,
    debt,
    close,
    back,
    several,
    history,
    // Desktop: the year showing. A phone: it and the older years added below it.
    months: byMonth(entries),
    allMonths: byMonth([...entries, ...older]),
    empty: !!history.records && !entries.length,
    // Money coming in, and what an overpayment took off a debt, in green
    isGreen: (entry: HistoryEntry) =>
      entry.kind === 'overpayment' || (payment.type === 'INCOME' && entry.amount !== null),
    paging: yearPaging(history.years, history.year),
    // "£2,340.00 left · £1,160 paid off · 33%", or "£20.00 a month · £150.00 paid in 2026"
    summary: debt
      ? {
          amount: formatMoney(debt.debt.balance),
          rest: `left · ${formatMoney(startedAt(debt) - debt.debt.balance, { whole: true })} paid off · ${Math.round(paidOffShare(debt) * 100)}%`
        }
      : {
          amount: formatMoney(payment.amount),
          rest: historySummary(payment, { entries, year: history.year })
        },
    // Its back arrow goes to the debt's view, as this one's did
    logOverpayment: debt
      ? () => {
          close();
          openOverpayment(debt.id, { fromView: backTo === 'debt' });
        }
      : undefined,
    undoOverpayment: (recordId: string) => void actions.undoOverpayment(recordId, payment.name)
  };
};

export type PaymentsDialogModel = NonNullable<ReturnType<typeof usePaymentsDialog>>;
