import { useState, useEffect } from 'react';

export const useSnackbarContainer = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findContainer = () => {
      const mainContent = document.getElementById('main');
      if (mainContent) {
        setContainer(mainContent);
        setIsLoading(false);
        return;
      }

      const timeoutId = setTimeout(findContainer, 100);
      return () => clearTimeout(timeoutId);
    };

    findContainer();
  }, [window.location.href]);

  return { container, isLoading };
};
