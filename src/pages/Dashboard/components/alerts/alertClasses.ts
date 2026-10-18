// "Later" is quiet on desktop and a full button on mobile, the same in every alert
export const laterClasses =
  'border-border bg-surface-2 md:border-transparent md:bg-transparent md:text-muted';

// An alert's text wraps rather than cutting anything short; the stack keeps every alert as tall
// as the tallest, so paging doesn't move the page
export const alertTextClasses = 'min-w-0';
export const alertTitleClasses = 'text-[15px] leading-[1.4] font-bold';
export const alertSublineClasses =
  'mt-0.5 text-xs leading-[1.45] font-medium text-muted md:text-[13px]';
