import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { Account } from '~/lib/accounts';
import { InfoNote } from '../../feedback';
import { LoadError, Modal, Pager } from '../../ui';
import { BalanceChangesList } from '../BalanceChangesList';
import { BalanceChangesTable } from '../BalanceChangesTable';
import { useBalanceChangesDialog } from './useBalanceChangesDialog';

interface BalanceChangesDialogProps {
  accounts: readonly Account[];
  today: Date;
}

/*
 * What moved a savings account's balance: interest added, money moved in and out, and balances typed
 * in, with the balance after each. Laid out as a payment's history is: a year at a time in columns
 * on desktop, a sheet of rows on a phone with older years added on asking.
 */
export const BalanceChangesDialog = ({ accounts, today }: BalanceChangesDialogProps) => {
  const dialog = useBalanceChangesDialog({ accounts, today });
  const isDesktop = useMediaQuery(MEDIA.desktop);
  if (!dialog) return null;
  const { account, history, summary } = dialog;

  return (
    <Modal
      open={dialog.open}
      size="wide"
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={`${account.name} balance changes`}
      onBack={dialog.back}
      backLabel={`Back to ${account.name}`}
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
      }>
      {history.error ? (
        <LoadError message="Couldn’t load the balance changes" onRetry={history.retry} />
      ) : dialog.empty ? (
        <p className="py-4 text-center text-sm font-semibold text-muted">
          No changes yet. Interest and money moved in or out show here as they happen.
        </p>
      ) : isDesktop ? (
        <BalanceChangesTable dialog={dialog} />
      ) : (
        <BalanceChangesList dialog={dialog} />
      )}
      <InfoNote>
        Balances between updates follow your payments and the interest worked out for you.{' '}
        <b>Update balance</b> from your bank whenever you want them exact.
      </InfoNote>
    </Modal>
  );
};
