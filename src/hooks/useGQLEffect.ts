import { useEffect, useRef } from 'react';

type Options<T> = {
  data?: T;
  error?: unknown;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

/**
 * Runs side effects in response to the result of an Apollo query.
 *
 * Apollo's `useQuery` only gives back `data` and `error`, so anything that should happen because
 * a query finished (updating context, showing a snackbar, redirecting) needs an effect. This hook
 * wraps that effect so callers just describe what to do:
 *
 * - when the query returns an `error`, `onError` is called with it
 * - otherwise, when it returns `data`, `onSuccess` is called with it
 *
 * The callbacks run once for each new `data` or `error` value, not on every render. They are
 * read from refs rather than listed as effect dependencies because callers normally pass inline
 * functions that are recreated each render. As dependencies they would make the effect re-fire
 * on every render, and a callback that updates state would then cause an endless render loop.
 * The refs always hold the latest callbacks, so they never see stale values.
 *
 * @example
 * const { data, error } = useQuery(FIND_USER_QUERY);
 * useGQLEffect({
 *   data,
 *   error,
 *   onSuccess: ({ tokenFindUser }) => dispatch({ type: EVENTS.LOGIN, data: tokenFindUser }),
 *   onError: handleGQLError
 * });
 */
export const useGQLEffect = <T>({ data, error, onSuccess, onError }: Options<T>) => {
  // Keep the latest callbacks in refs (updated after every render)
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (error) {
      onErrorRef.current?.(error);
      return;
    }

    if (data) onSuccessRef.current?.(data);
  }, [data, error]);
};
