import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  DebtHistoryDocument,
  LogDebtOverpaymentDocument,
  UndoDebtOverpaymentDocument,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { DebtPayment } from '~/lib/debts';
import { getApiErrorMessage, hasErrorCode } from '~/lib/errors';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD } from '~/lib/payments';
import { showToast } from '~/state/toast';

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/* Overpaying a debt, taking an overpayment back, and paying more each time from the payoff plan */
export const useDebtActions = (accountId: string) => {
  const client = useApolloClient();
  const { remove, showPaidOff } = usePaymentActions(accountId);
  const [logOverpayment] = useMutation(LogDebtOverpaymentDocument);
  const [undoOverpaymentMutation] = useMutation(UndoDebtOverpaymentDocument);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);

  /* Puts an overpayment from this cycle back on the debt and the bank balance */
  const undoOverpayment = async (recordId: string, name: string) => {
    try {
      await undoOverpaymentMutation({ variables: { input: { accountId, recordId } } });
      showToast({ message: `Took back the overpayment on ${name}` });
    } catch (error) {
      showError(error);
    }
  };

  /*
   * Pays extra off a debt today. It comes off the debt and the bank balance. Resolves to a message
   * for the amount when the API turns it down (e.g. more than is left), otherwise null.
   */
  const overpay = async (debt: DebtPayment, amount: number): Promise<string | null> => {
    try {
      const { data } = await logOverpayment({
        variables: { input: { accountId, recurringPaymentId: debt.id, amount } }
      });
      const after = data?.logDebtOverpayment.account?.recurringPayments?.find(
        payment => payment?.id === debt.id
      );
      if (after?.debt?.balance === 0) {
        showPaidOff(debt);
        return null;
      }
      // The overpayment's record, so the toast can take it back
      const history = await client.query({
        query: DebtHistoryDocument,
        // The newest few are enough to find the one just made
        variables: { id: debt.id, limit: 5 },
        fetchPolicy: 'network-only'
      });
      const record = history.data?.recurringPayment?.history.find(
        item => item.kind === 'OVERPAYMENT' && item.open
      );
      showToast({
        message: `${formatMoney(amount)} paid off ${debt.name} · off your balance`,
        action: record
          ? { label: 'Undo', onClick: () => void undoOverpayment(record.id, debt.name) }
          : undefined
      });
      return null;
    } catch (error) {
      if (hasErrorCode(error, 'BAD_USER_INPUT')) return getApiErrorMessage(error);
      showError(error);
      return null;
    }
  };

  /* The payoff plan's extra: the debt's payment goes up by it from the next one */
  const payMore = async (debt: DebtPayment, amount: number) => {
    try {
      await updateRecurring({ variables: { id: debt.id, input: { amount } } });
      showToast({
        message: `${debt.name} is now ${formatMoney(amount)} ${PER_PERIOD[debt.frequency]}`
      });
    } catch (error) {
      showError(error);
    }
  };

  return { overpay, undoOverpayment, payMore, remove };
};
