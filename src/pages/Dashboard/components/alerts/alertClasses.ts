// "Later" is quiet on desktop and a full button on mobile, the same in every alert
export const laterClasses =
  'border-border bg-surface-2 md:border-transparent md:bg-transparent md:text-muted';

// The heading and the line under it stay one line each on mobile, so every alert is the same
// height and paging between them doesn't move the page
export const alertTitleClasses = 'text-[15px] font-bold max-md:truncate';
export const alertSublineClasses =
  'mt-0.5 text-xs font-medium text-muted max-md:truncate md:text-[13px]';
