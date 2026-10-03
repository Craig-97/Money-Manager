import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { ErrorState } from '~/components/feedback/ErrorState';
import { Button } from '~/components/ui/Button';

/* Shown when a route throws while rendering or fails to load its code */
export const RouteError = () => {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <ErrorState
        title="Something went wrong"
        message="Reloading the page usually fixes this. If it keeps happening, try again later."
        action={
          <Button variant="solid" onClick={() => window.location.reload()}>
            Reload the page
          </Button>
        }
      />
    </div>
  );
};
