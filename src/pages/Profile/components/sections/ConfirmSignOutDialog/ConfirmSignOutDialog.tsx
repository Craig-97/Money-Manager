import { Modal, ModalActions } from '~/components/ui';
import { ConfirmedSignOut } from '../../../hooks';

interface ConfirmSignOutDialogProps {
  confirmed: ConfirmedSignOut;
  title: string;
  body: string;
  // Closes without doing it
  keepLabel: string;
  action: {
    label: string;
    loadingText: string;
    variant: 'accent' | 'danger';
  };
}

/* "Delete your account?" or "Sign out everywhere?": what happens, then keep or go ahead */
export const ConfirmSignOutDialog = ({
  confirmed,
  title,
  body,
  keepLabel,
  action: { label, loadingText, variant }
}: ConfirmSignOutDialogProps) => (
  <Modal
    open={confirmed.open}
    onOpenChange={confirmed.setOpen}
    title={title}
    footer={
      <ModalActions
        cancel={{ label: keepLabel, onClick: () => confirmed.setOpen(false) }}
        confirm={{
          label,
          onClick: confirmed.confirm,
          loading: confirmed.loading,
          loadingText,
          variant
        }}
      />
    }>
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted">{body}</p>
      {confirmed.error ? (
        <p role="alert" className="text-sm font-bold text-expense">
          {confirmed.error}
        </p>
      ) : null}
    </div>
  </Modal>
);
