import { cn } from '~/lib/cn';
import { Renewal, renewalTag } from '~/lib/payments';
import { accentTagClasses, redTagClasses, tagClasses } from '../tagClasses';

/* "Renews in 22 days" in the accent while it's coming up, "Renews 19 Jan" otherwise */
export const RenewalTag = ({
  renewal,
  today,
  className
}: {
  renewal: Renewal;
  today: Date;
  className?: string;
}) => (
  <span
    className={cn(
      renewal.passed ? redTagClasses : renewal.soon ? accentTagClasses : tagClasses,
      className
    )}>
    {renewalTag(renewal, today)}
  </span>
);
