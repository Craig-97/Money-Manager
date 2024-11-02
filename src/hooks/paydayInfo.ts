import { useEffect, useRef, useState } from 'react';
import { BANK_HOLIDAY_REGION, PAY_FREQUENCY, PAYDAY_TYPE } from '~/constants';
import { Payday } from '~/types';
import { getPayday } from '~/utils';

const config: Payday = {
  type: PAYDAY_TYPE.SET_DAY,
  frequency: PAY_FREQUENCY.MONTHLY,
  dayOfMonth: 28,
  weekday: undefined,
  firstPayDate: undefined,
  bankHolidayRegion: BANK_HOLIDAY_REGION.SCOTLAND
};

interface PaydayInfo {
  payday: string | null;
  isPayday: boolean | null;
}

export const useGetPayday = () => {
  const [paydayInfo, setPaydayInfo] = useState<PaydayInfo>({ payday: null, isPayday: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchPayday = async () => {
      try {
        const result = await getPayday(new Date(), config);
        setPaydayInfo({ payday: result.payday, isPayday: result.isPayday });
      } catch (error) {
        setError('Failed to fetch payday information.');
        console.error('Error fetching payday:', error);
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchPayday();
  }, []);

  return { paydayInfo, loading, error };
};
