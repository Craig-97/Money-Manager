import { MEDIA } from '~/constants';
import { Account } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useRecurring } from '../../hooks';
import { CategoryTile } from '../CategoryTile';
import { MobileFilters } from '../MobileFilters';
import { MobileRecurringList } from '../MobileRecurringList';
import { MobileSummary } from '../MobileSummary';
import { RecurringTable } from '../RecurringTable';
import { RenewalsTile } from '../RenewalsTile';
import { SummaryStats } from '../SummaryStats';

// From here the renewals and categories sit side by side, so the category legend is one column
const SPLIT = '(min-width: 56.25rem)';

/* The page once the account has loaded. Only one layout is rendered, so each control exists once. */
export const RecurringContent = ({ account }: { account: Account }) => {
  const recurring = useRecurring(account);
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const isSplit = useMediaQuery(SPLIT);

  return isDesktop ? (
    <section aria-label="Recurring payments" className="flex flex-col gap-4">
      <SummaryStats recurring={recurring} />
      <div className="grid items-stretch gap-4 min-[56.25rem]:grid-cols-2">
        <RenewalsTile recurring={recurring} />
        <CategoryTile breakdown={recurring.breakdown} narrow={isSplit} />
      </div>
      <RecurringTable recurring={recurring} />
    </section>
  ) : (
    <section aria-label="Recurring payments" className="flex flex-col gap-3.5">
      <MobileSummary recurring={recurring} />
      <RenewalsTile recurring={recurring} compact />
      {recurring.isEmpty ? null : <MobileFilters recurring={recurring} />}
      <MobileRecurringList recurring={recurring} />
      <CategoryTile breakdown={recurring.breakdown} narrow compact />
    </section>
  );
};
