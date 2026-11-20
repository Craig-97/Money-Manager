import { ArrowUp } from 'lucide-react';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { InfoNote } from '../../feedback';
import { Button, LoadError, Modal, Pager } from '../../ui';
import { PaymentsList } from '../PaymentsList';
import { PaymentsTable } from '../PaymentsTable';
import { usePaymentsDialog } from './usePaymentsDialog';

/*
 * A recurring payment's payments, a debt's included: See payments from its view or its menu. On
 * desktop a year at a time in columns, the years paged under the title, which stays put as they
 * scroll; on a phone a sheet of rows, with older years added on asking.
 */
export const PaymentsDialog = () => {
  const dialog = usePaymentsDialog();
  const isDesktop = useMediaQuery(MEDIA.desktop);
  if (!dialog) return null;
  const { payment, debt, history, summary } = dialog;

  return (
    <Modal
      open={dialog.open}
      size="wide"
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={`${payment.name} payments`}
      onBack={dialog.back}
      backLabel={`Back to ${payment.name}`}
      subtitle={
        <span className="mt-0.5 flex items-center gap-3">
          <span className="min-w-0 flex-1 text-[13px] font-semibold text-muted">
            <span className="mr-0.5 num font-extrabold text-text">{summary.amount}</span>{' '}
            {summary.rest}
          </span>
          {isDesktop && history.years.length > 1 ? (
            <Pager
              paging={dialog.paging}
              onPage={page => history.showYear(dialog.paging.yearOf(page))}
              of="year"
            />
          ) : null}
        </span>
      }
      footer={
        dialog.logOverpayment ? (
          <>
            <span className="flex-1" />
            <Button variant="accent" onClick={dialog.logOverpayment}>
              <ArrowUp size={16} aria-hidden="true" />
              Log an overpayment
            </Button>
          </>
        ) : undefined
      }>
      {history.error ? (
        <LoadError message="Couldn’t load the payments" onRetry={history.retry} />
      ) : dialog.empty ? (
        <p className="py-4 text-center text-sm font-semibold text-muted">
          Nothing paid yet. Payments show here once you mark one as paid.
        </p>
      ) : isDesktop ? (
        <PaymentsTable dialog={dialog} />
      ) : (
        <PaymentsList dialog={dialog} />
      )}
      {debt ? (
        <InfoNote>
          Balances after each payment are worked out from your APR. <b>Update balance</b> from a
          statement whenever you want them exact.
        </InfoNote>
      ) : (
        <InfoNote>
          Each payment keeps the amount it was when it was marked paid, so a price change shows
          where it happened.
        </InfoNote>
      )}
    </Modal>
  );
};
