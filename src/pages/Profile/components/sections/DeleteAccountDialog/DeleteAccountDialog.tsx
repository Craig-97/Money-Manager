import { Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { useDeleteAccount } from '../../../hooks';

export const DeleteAccountDialog = ({
  remove
}: {
  remove: ReturnType<typeof useDeleteAccount>;
}) => (
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
