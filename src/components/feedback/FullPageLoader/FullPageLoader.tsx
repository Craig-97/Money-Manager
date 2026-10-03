import { Spinner } from '~/components/ui/Spinner';

export const FullPageLoader = ({ label = 'Loading' }: { label?: string }) => (
  <div role="status" className="flex h-dvh items-center justify-center text-muted">
    <Spinner className="size-6" />
    <span className="sr-only">{label}</span>
  </div>
);
