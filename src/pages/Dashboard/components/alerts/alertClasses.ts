// "Later" is quiet on desktop and a full button on mobile, the same in every alert
export const laterClasses =
  'border-border bg-surface-2 md:border-transparent md:bg-transparent md:text-muted';

// On mobile every alert keeps room for two lines of heading and two under it, so they're all the
// same height and paging between them doesn't move the page, without cutting any short
export const alertTextClasses =
  'min-w-0 max-md:flex max-md:min-h-[88px] max-md:flex-col max-md:justify-center';
export const alertTitleClasses = 'text-[15px] leading-[1.4] font-bold max-md:line-clamp-2';
export const alertSublineClasses =
  'mt-0.5 text-xs leading-[1.45] font-medium text-muted max-md:line-clamp-2 md:text-[13px]';
