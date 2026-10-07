import { LogOut, MonitorOff, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { SECTION_ICONS } from './sectionIcons';
import { helpClasses, SettingsTile } from './SettingsTile';
import { useDeleteAccount, useLogoutEverywhere } from '../../hooks';

const dangerButton =
  'border-expense bg-transparent font-bold text-expense hover:bg-expense-bg max-md:w-full';

const DeleteAccountDialog = ({ remove }: { remove: ReturnType<typeof useDeleteAccount> }) => (
  <Modal
    open={remove.open}
    onOpenChange={remove.setOpen}
    title="Delete your account?"
    footer={
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <Button size="lg" onClick={() => remove.setOpen(false)}>
          Keep my account
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={remove.confirm}
          loading={remove.deleting}
          loadingText="Deleting…"
          className="font-bold">
          <Trash2 size={16} aria-hidden="true" />
          Delete everything
        </Button>
      </div>
    }>
    <div className="flex flex-col gap-3 px-5 pb-2 md:px-7">
      <p className="text-sm leading-relaxed text-muted">
        This permanently deletes your account, payments and notes. You won’t be able to get them
        back.
      </p>
      {remove.error ? (
        <p role="alert" className="text-sm font-bold text-expense">
          {remove.error}
        </p>
      ) : null}
    </div>
  </Modal>
);

const LogoutEverywhereDialog = ({
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

/* Log out, signing out everywhere, and deleting the account */
export const AccountSection = ({ email, onLogout }: { email: string; onLogout: () => void }) => {
  const remove = useDeleteAccount();
  const everywhere = useLogoutEverywhere();

  return (
    <SettingsTile
      id="account"
      icon={SECTION_ICONS.account}
      title="Account"
      description="Your sessions, and deleting your account."
      mobileDescription={`Signed in as ${email}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-1">
        <div className="hidden min-w-0 flex-col gap-1 md:flex">
          <span className="text-[13px] font-bold">Log out</span>
          <p className={helpClasses}>
            Signed in as <span className="font-bold text-text">{email}</span> on this device.
          </p>
        </div>
        <Button
          onClick={onLogout}
          className="border-border-strong bg-transparent font-bold max-md:h-12 max-md:w-full">
          <LogOut size={16} aria-hidden="true" />
          Log out
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-4">
        <div className="hidden min-w-0 flex-col gap-1 md:flex">
          <span className="text-[13px] font-bold">Sign out everywhere</span>
          <p className={helpClasses}>
            Ends your session on every device. Use it if you lost a phone or used a shared computer.
          </p>
        </div>
        <Button
          onClick={() => everywhere.setOpen(true)}
          className="border-border-strong bg-transparent font-bold max-md:h-12 max-md:w-full">
          <MonitorOff size={16} aria-hidden="true" />
          Sign out everywhere
        </Button>
      </div>
      <section
        aria-labelledby="danger-title"
        className="overflow-hidden rounded-[20px] border border-expense/35 max-md:bg-expense-bg">
        <div className="flex items-center gap-2.5 px-[18px] py-3 text-expense md:bg-expense-bg md:px-6">
          <TriangleAlert size={16} aria-hidden="true" />
          <h3
            id="danger-title"
            className="text-[15px] font-extrabold md:text-xs md:tracking-[0.08em] md:uppercase">
            Danger zone
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 px-[18px] pb-[18px] md:px-6 md:py-[22px]">
          <div className="flex max-w-[560px] min-w-0 flex-col gap-1">
            <span className="hidden text-[13px] font-bold md:block">Delete account</span>
            <p className={`${helpClasses} max-md:text-text`}>
              Permanently deletes your account, payments and notes. This can’t be undone.
            </p>
          </div>
          <Button onClick={() => remove.setOpen(true)} className={dangerButton}>
            <Trash2 size={16} aria-hidden="true" />
            Delete account
          </Button>
        </div>
      </section>
      <LogoutEverywhereDialog everywhere={everywhere} />
      <DeleteAccountDialog remove={remove} />
    </SettingsTile>
  );
};
