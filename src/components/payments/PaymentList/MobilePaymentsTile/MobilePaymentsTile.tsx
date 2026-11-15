import { ReactNode } from 'react';
import { MobileBulkBar, MobileSortButton } from '../../PaymentControls';
import { SortProps } from '../../PaymentControls/sortProps';
import { bulkActions, PaymentList } from '../paymentList';

interface MobilePaymentsTileProps extends SortProps {
  headingId: string;
  list: PaymentList;
  // Sorting and Select only show once there's something to sort or select
  isEmpty: boolean;
  // The lists it can show, under the title
  tabs: ReactNode;
  children: ReactNode;
}

/*
 * Mobile: the Payments tile, with sorting and Select, which turns on ticking several at once and
 * puts the bulk actions over the bottom nav
 */
export const MobilePaymentsTile = ({
  headingId,
  list,
  isEmpty,
  tabs,
  sort,
  onSort,
  children
}: MobilePaymentsTileProps) => {
  const { selection } = list;

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-3">
      <div className="flex min-h-12 items-center justify-between pb-1 pl-2">
        <h2 id={headingId} className="scroll-mt-4 text-base font-extrabold tracking-[-0.02em]">
          Payments
        </h2>
        {isEmpty ? null : (
          <div className="flex items-center">
            <MobileSortButton sort={sort} onSort={onSort} />
            <button
              type="button"
              onClick={selection.toggleSelecting}
              className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-sm font-bold text-accent-text hover:bg-hover">
              {selection.selecting ? 'Done' : 'Select'}
            </button>
          </div>
        )}
      </div>
      {tabs}
      {children}
      {selection.selecting ? (
        <MobileBulkBar
          count={selection.selectedPayments.length}
          {...bulkActions(list, { done: selection.stopSelecting })}
        />
      ) : null}
    </article>
  );
};
