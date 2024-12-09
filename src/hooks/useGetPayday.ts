import { useEffect, useRef, useState } from 'react';
import { client } from '~/graphql';
import { GET_ACCOUNT_QUERY } from '~/graphql';
import { useAccountStore, useUserContext } from '~/state';
import { getPayday } from '~/utils';

interface PaydayInfo {
  payday: string | null;
  isPayday: boolean | null;
}

export const useGetPayday = () => {
  const { user } = useUserContext();
  const paydayConfig = useAccountStore(s => s.account?.paydayConfig ?? null);
  const [paydayInfo, setPaydayInfo] = useState<PaydayInfo>({ payday: null, isPayday: null });

  /**
   * Checks if the user has a payday configuration from the GraphQL cache
   * to prevent component pop-in when using paydayConfig from context.
   */
  const queryData = client.readQuery({
    query: GET_ACCOUNT_QUERY,
    variables: { id: user.id }
  });
  const hasPaydayConfig = Boolean(queryData?.account?.payday);

  const [loading, setLoading] = useState<boolean>(hasPaydayConfig);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !paydayConfig) return;

    const fetchPayday = async () => {
      try {
        const result = await getPayday(new Date(), paydayConfig);
        setPaydayInfo({ payday: result.payday, isPayday: result.isPayday });
      } catch (_error) {
        setError('Failed to fetch payday information.');
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchPayday();
  }, [paydayConfig]);

  return { paydayInfo, loading, error };
};