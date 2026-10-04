import { useEffect, useState } from 'react';

/* Counts down a number of seconds after start() is called, e.g. before an email can be resent */
export const useCooldown = (seconds: number) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return {
    remaining,
    coolingDown: remaining > 0,
    start: () => setRemaining(seconds),
    stop: () => setRemaining(0)
  };
};
