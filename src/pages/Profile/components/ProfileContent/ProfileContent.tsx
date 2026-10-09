import { useState } from 'react';
import { MEDIA } from '~/constants';
import { CurrentUserQuery } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { useLogout } from '~/hooks/useLogout';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { SectionId } from '../../profileModel';
import { ProfileJumpChips, ProfileNav } from '../nav';
import { ProfileSummary } from '../ProfileSummary';
import {
  AccountSection,
  AppearanceSection,
  BalancesSection,
  DetailsSection,
  PasswordSection,
  PaydaySection
} from '../sections';

type User = NonNullable<CurrentUserQuery['tokenFindUser']>;

export const ProfileContent = ({ user, account }: { user: User; account: Account }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const logout = useLogout();
  const [current, setCurrent] = useState<SectionId>('personal');

  const jump = (id: SectionId) => {
    setCurrent(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = (
    <div className="flex min-w-0 flex-col gap-3.5 md:gap-4">
      <DetailsSection user={user} />
      <PasswordSection />
      <PaydaySection account={account} />
      <BalancesSection account={account} />
      <AppearanceSection />
      <AccountSection email={user.email} onLogout={logout} />
    </div>
  );

  return (
    <>
      <ProfileSummary user={user} account={account} compact={!isDesktop} />
      {isDesktop ? (
        <div className="grid items-start gap-6 wide:grid-cols-[232px_minmax(0,1fr)]">
          <ProfileNav current={current} onJump={jump} onLogout={logout} />
          {sections}
        </div>
      ) : (
        <>
          <ProfileJumpChips current={current} onJump={jump} />
          {sections}
        </>
      )}
    </>
  );
};
