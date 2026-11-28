// The floating panel shared by selects, menus and the date picker. Above modals (z-90), so they
// work inside one.
export const popoverClasses =
  'z-100 rounded-[22px] border border-border-strong bg-surface shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)] outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in';

// An option or menu item: a 44px pill that highlights under the pointer or keyboard
export const optionClasses =
  'flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-full px-3.5 text-left text-sm font-semibold text-text outline-none select-none data-highlighted:bg-hover data-disabled:cursor-not-allowed data-disabled:opacity-50';

// A small card of details shown on hover, like the cycle bar's days: a bold first line, then one
// line for each thing it lists
export const hintCardClasses =
  'flex flex-col gap-[3px] rounded-[14px] border border-border-strong bg-surface px-3 py-[9px] text-xs font-medium whitespace-nowrap text-text shadow-[0_12px_28px_-10px_rgb(0_0_0/0.5)]';
