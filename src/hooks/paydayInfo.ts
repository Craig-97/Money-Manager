import { useEffect, useState } from 'react';
import { BANK_HOLIDAY_REGION, PAY_FREQUENCY, PAYDAY_TYPE, PaydayConfig } from '~/types';
import { getPayday } from '~/utils';

export const useGetPayday = () => {
  const [paydayInfo, setPaydayInfo] = useState<{ payday: Date | null; isPayday: boolean | null }>({
    payday: null,
    isPayday: null
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO - Get this from account rather than hardcode after API work done
    const config: PaydayConfig = {
      type: PAYDAY_TYPE.SET_DAY,
      frequency: PAY_FREQUENCY.MONTHLY,
      dayOfMonth: 28,
      bankHolidayRegion: BANK_HOLIDAY_REGION.SCOTLAND
    };

    const fetchPayday = async () => {
      try {
        const result = await getPayday(new Date(), config);
        setPaydayInfo({ payday: result.payday, isPayday: result.isPayday });
      } catch (error) {
        setError('Failed to fetch payday information.');
        console.error('Error fetching payday:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayday();
  }, []);

  return { paydayInfo, loading, error };
};
