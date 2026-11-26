import { useState } from 'react';
import { startOfToday } from '~/lib/dates';
import { paydayExample } from '../paydayExample';
import { usePaydayPrompt } from './usePaydayPrompt';

/* The payday prompt worked out from the tour's example, by the same rules as the real one */
export const usePaydayExample = () => {
  const [example] = useState(() => paydayExample(startOfToday()));
  return usePaydayPrompt({
    ...example,
    today: example.cycle.start,
    // Nothing in an example is ever saved
    markPaid: async () => undefined
  });
};
