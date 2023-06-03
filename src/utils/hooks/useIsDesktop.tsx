import { useCallback, useEffect, useRef, useState } from 'react';

export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const isDesktopRef = useRef(isDesktop);

  const setDesktopState = (boolean: boolean) => {
    isDesktopRef.current = boolean;
    setIsDesktop(boolean);
  };

  const handleWindowSizeChange = useCallback(() => {
    if (!isDesktopRef.current && window.innerWidth > 1250) {
      setDesktopState(true);
    } else if (isDesktopRef.current && window.innerWidth < 1250) {
      setDesktopState(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    handleWindowSizeChange();
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, [handleWindowSizeChange]);

  return isDesktop;
};
