import { BulkActionsProps } from '../BulkActions';

/* Mobile select mode: sits over the bottom nav with the bulk actions */
export const MobileBulkBar = ({
  count,
  onPay,
  onDelete
}: Pick<BulkActionsProps, 'count' | 'onPay' | 'onDelete'>) => {
  const none = count === 0;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-45 flex justify-center bg-linear-to-t from-bg from-60% to-transparent px-4 pt-6 pb-[calc(22px+env(safe-area-inset-bottom))]">
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="pointer-events-auto flex w-full items-center gap-1.5 rounded-full border border-border bg-nav-bg py-1.5 pr-1.5 pl-[18px] text-nav-active-bg shadow-[0_18px_36px_-14px_var(--shadow)]">
        <span className="grow num text-sm font-extrabold">{count} selected</span>
        <button
          type="button"
          disabled={none}
          onClick={onPay}
          className="inline-flex h-11 cursor-pointer items-center rounded-full bg-nav-active-bg px-4 text-[13px] font-bold text-nav-active-text disabled:cursor-default disabled:opacity-45">
          Mark paid
        </button>
        <button
          type="button"
          disabled={none}
          onClick={onDelete}
          className="inline-flex h-11 cursor-pointer items-center rounded-full bg-expense-bg px-4 text-[13px] font-bold text-expense disabled:cursor-default disabled:opacity-45">
          Delete
        </button>
      </div>
    </div>
  );
};
