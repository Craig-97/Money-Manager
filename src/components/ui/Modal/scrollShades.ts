/*
 * The shades on a dialog's or sheet's fixed header and footer: a hairline and a soft shadow while
 * content passes under them, nothing once there's nothing to scroll. They sit above the scrolling
 * body, so cards with their own background can't cover them.
 */
export const headerShade = (shaded: boolean) =>
  shaded
    ? 'relative z-10 transition-shadow shadow-[0_1px_0_var(--border),0_14px_18px_-16px_var(--shadow)]'
    : 'relative z-10 transition-shadow shadow-[0_1px_0_transparent]';

export const footerShade = (shaded: boolean) =>
  shaded
    ? 'relative z-10 transition-shadow shadow-[0_-1px_0_var(--border),0_-14px_18px_-16px_var(--shadow)]'
    : 'relative z-10 transition-shadow shadow-[0_-1px_0_transparent]';

/* A scrolling body's children keep their height: a card that clips its corners would otherwise be
   squashed to nothing once the sheet reaches its height limit */
export const scrollBodyClasses = 'min-h-0 flex-auto overflow-y-auto *:shrink-0';
