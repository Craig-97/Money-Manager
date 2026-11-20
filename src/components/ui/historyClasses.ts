// A payment's or an account's history: the same table on desktop and list on a phone for both

// Desktop: the column headings, which stay put as the rows scroll under them
export const historyHeadClasses =
  'sticky -top-2.5 z-1 min-h-10 border-b border-border bg-surface px-2 text-xs font-bold tracking-[0.04em] text-muted uppercase';
export const historyRowClasses = 'min-h-16 rounded-2xl px-2 py-1.5 hover:bg-hover';
export const historyMonthClasses = 'px-2 pt-2 pb-1 text-xs font-bold text-muted';
// What happened, then beside it what's worth knowing about it: "Paid  Up from £18.00"
export const historyNoteClasses = 'text-xs font-bold text-muted';

// A phone: a heading for each month, then a row for each
export const historyListMonthClasses =
  'pt-2.5 pb-1 text-xs font-bold tracking-[0.06em] text-muted uppercase';
export const historyListRowClasses = 'flex min-h-[68px] items-center gap-3 py-2';
