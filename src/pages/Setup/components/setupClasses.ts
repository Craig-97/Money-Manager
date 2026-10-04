// Shared classes for setup's steps, from the design's .lbl, .sublbl, .help and .seg styles

// A question, e.g. "How often are you paid?"
export const questionClasses = 'mb-3 block text-[15px] font-extrabold tracking-[-0.01em]';

// A small label above a field
export const fieldLabelClasses = 'mb-1.5 block text-xs font-bold text-muted';

export const helpClasses = 'mt-2 text-[13px] leading-normal font-medium text-muted';

// A pill that stays pressed when picked, e.g. a pay frequency
export { choiceClasses } from '~/components/form/fieldClasses';

// The rounded card each step sits in
export const stepCardClasses = 'rounded-[28px] border border-border bg-surface';

// "Edit" and similar small actions inside a card
export const linkButtonClasses =
  '-my-1.5 -mr-2 inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-soft px-3.5 text-[13px] font-bold whitespace-nowrap text-accent-text hover:brightness-115 disabled:cursor-default disabled:bg-surface-2 disabled:text-muted disabled:hover:brightness-100';
