import { cn } from '~/lib/cn';
import { NextChange, NextChangeForm, nextChangeText } from '~/lib/payments';
import { accentTagClasses, redTagClasses, tagClasses, warnTagClasses } from '../tagClasses';

/* A tag's colour: an ending is always amber; otherwise red once gone by, accent when coming up */
const toneClasses = (next: NextChange) => {
  if (next.kind === 'stops') return warnTagClasses;
  if (next.passed) return redTagClasses;
  if (next.soon) return accentTagClasses;
  return tagClasses;
};

/*
 * What happens next to a payment: "Renews 19 Jan" or "Rate ends 1 Mar 2027", in the accent while
 * it's coming up and red once it has gone by, or "Ends 1 Mar" and "Last one in 5 days" in amber.
 * Short is for a column whose heading says the rest ("19 Jan"); when is how long until it.
 */
export const NextChangeTag = ({
  next,
  today,
  form = 'long',
  className
}: {
  next: NextChange;
  today: Date;
  form?: NextChangeForm;
  className?: string;
}) => (
  <span className={cn(toneClasses(next), className)}>{nextChangeText(next, { today, form })}</span>
);
