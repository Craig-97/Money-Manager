import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { Checkbox, CheckboxHitArea } from '../../../form';
import { BulkActions } from '../../PaymentControls';
import { bulkActions, PaymentList } from '../paymentList';

interface PaymentTableHeadProps {
  // The select-all checkbox's id, unique on the page
  id: string;
  list: PaymentList;
  // The table's grid, which the headings line up with
  rowClassName: string;
  // The column headings between Payment and Amount
  children: ReactNode;
}

/* The table's headings with select all, or the bulk actions once any payment is ticked */
export const PaymentTableHead = ({ id, list, rowClassName, children }: PaymentTableHeadProps) => {
  const { selection } = list;
  const { selectedPayments, allSelected } = selection;
  const selectAll = (
    <CheckboxHitArea htmlFor={id}>
      <Checkbox
        id={id}
        checked={allSelected}
        indeterminate={selectedPayments.length > 0 && !allSelected}
        onChange={() => selection.selectAll(!allSelected)}
        aria-label="Select all payments"
      />
    </CheckboxHitArea>
  );

  return selectedPayments.length ? (
    <BulkActions
      selectAll={selectAll}
      count={selectedPayments.length}
      {...bulkActions(list, { done: selection.clear })}
      onClear={selection.clear}
    />
  ) : (
    <div
      role="row"
      className={cn(
        rowClassName,
        'min-h-[52px] text-xs font-bold tracking-[0.04em] text-muted uppercase'
      )}>
      <span role="cell">{selectAll}</span>
      <span role="columnheader">Payment</span>
      {children}
      <span role="columnheader" className="text-right">
        Amount
      </span>
      <span />
    </div>
  );
};
