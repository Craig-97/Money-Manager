import { useState } from 'react';

/* Which of a stack of alerts is showing. Dealing with the last one moves back to the one before. */
export const useAlertIndex = (count: number) => {
  const [index, setIndex] = useState(0);
  const last = Math.max(0, count - 1);
  return {
    index: Math.min(index, last),
    go: (next: number) => setIndex(Math.max(0, Math.min(last, next)))
  };
};
