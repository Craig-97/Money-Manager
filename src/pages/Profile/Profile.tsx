import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { useBudget } from '~/hooks/useBudget';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { ProfileContent, ProfileSkeleton } from './components';

export const Profile = () => {
  const { budget, loading, retry } = useBudget();
  const { user, error: userError, refetch } = useCurrentUser();

  return (
    <>
      <PageHeader title="Profile" />
      {budget && user ? (
        <ProfileContent user={user} budget={budget} />
      ) : loading || (!user && !userError) ? (
        <ProfileSkeleton />
      ) : (
        <BudgetError
          onRetry={() => {
            retry();
            void refetch();
          }}
        />
      )}
    </>
  );
};
