import { MonitorOff } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { useLogoutEverywhere } from '../../../hooks';

export const LogoutEverywhereDialog = ({
  everywhere
}: {
  everywhere: ReturnType<typeof useLogoutEverywhere>;
}) => (
  <Modal
    open={everywhere.open}
    onOpenChange={everywhere.setOpen}
    title="Sign out everywhere?"
    footer={
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <Button size="lg" onClick={() => everywhere.setOpen(false)}>
          Stay signed in
        </Button>
        <Button
          variant="accent"
          size="lg"
          onClick={everywhere.confirm}
          loading={everywhere.signingOut}
          loadingText="Signing out…"
          className="font-bold">
          <MonitorOff size={16} aria-hidden="true" />
          Sign out everywhere
        </Button>
      </div>
    }>
    <div className="flex flex-col gap-3 px-5 pb-2 md:px-7">
      <p className="text-sm leading-relaxed text-muted">
        This signs you out on every device, including this one. Any other device that is open will
        be asked to sign in again the next time it talks to Money Manager.
      </p>
      {everywhere.error ? (
        <p role="alert" className="text-sm font-bold text-expense">
          {everywhere.error}
        </p>
      ) : null}
    </div>
  </Modal>
);
