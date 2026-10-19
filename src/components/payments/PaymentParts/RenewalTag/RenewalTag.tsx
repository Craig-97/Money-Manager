import { cn } from '~/lib/cn';
import { Renewal, renewalDay, renewalTag } from '~/lib/payments';
import { accentTagClasses, redTagClasses, tagClasses } from '../tagClasses';

/*
 * "Renews in 22 days" in the accent while it's coming up, "Renews 19 Jan" otherwise. Short drops
 * "Renews" for a Renewal column: "In 22 days", "19 Jan".
 */
export const RenewalTag = ({
  renewal,
  today,
  short = false,
  className
}: {
  renewal: Renewal;
  today: Date;
  short?: boolean;
  className?: string;
}) => (
  <span
    className={cn(
      renewal.passed ? redTagClasses : renewal.soon ? accentTagClasses : tagClasses,
      className
    )}>
    {short ? renewalDay(renewal, today) : renewalTag(renewal, today)}
  </span>
);
