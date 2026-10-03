import { useEffect, useEffectEvent } from 'react';

/* Calls onEscape when Escape is pressed anywhere, while active */
export const useEscapeKey = (onEscape: () => void, active = true) => {
  const handleEscape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleEscape();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
};
