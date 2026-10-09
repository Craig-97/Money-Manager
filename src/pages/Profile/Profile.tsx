import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { useAccount } from '~/hooks/useAccount';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { ProfileContent, ProfileSkeleton } from './components';

export const Profile = () => {
  const { account, loading, retry } = useAccount();
  const { user, error: userError, refetch } = useCurrentUser();

  return (
    <>
      <PageHeader title="Profile" />
      {account && user ? (
        <ProfileContent user={user} account={account} />
      ) : loading || (!user && !userError) ? (
        <ProfileSkeleton />
      ) : (
        <AccountError
          onRetry={() => {
            retry();
            void refetch();
          }}
        />
      )}
    </>
  );
};
