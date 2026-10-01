import { useEffect } from 'react';

type Options<T> = {
  data?: T;
  error?: unknown;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export const useGQLEffect = <T>({ data, error, onSuccess, onError }: Options<T>) => {
  useEffect(() => {
    if (error) {
      onError?.(error);
      return;
    }

    if (data) onSuccess?.(data);
  }, [data, error, onSuccess, onError]);
};
