import { ReactNode } from 'react';
import { Trash } from 'lucide-react';
import { Button } from '../Button';

interface ModalActionsProps {
  // On the left, before the buttons: a link or a summary
  start?: ReactNode;
  // On the left, in red: deletes or removes what the dialog is about
  remove?: { label: string; onClick: () => void };
  // Closes without saving
  cancel: { label?: string; onClick: () => void };
  // The main button
  confirm: {
    label: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    // Shown with the spinner while it's loading, e.g. "Deleting…"
    loadingText?: string;
    variant?: 'accent' | 'danger';
  };
}

/*
 * A dialog's footer: anything on the left, then Cancel and the main button on the right, both
 * full height on a phone
 */
export const ModalActions = ({ start, remove, cancel, confirm }: ModalActionsProps) => (
  <>
    {remove ? (
      <Button variant="dangerGhost" onClick={remove.onClick} className="max-md:-ml-2">
        <Trash size={16} aria-hidden="true" />
        {remove.label}
      </Button>
    ) : null}
    {start}
    <span className="flex-1" />
    <Button variant="ghost" onClick={cancel.onClick} className="max-md:h-[52px]">
      {cancel.label ?? 'Cancel'}
    </Button>
    <Button
      variant={confirm.variant ?? 'accent'}
      onClick={confirm.onClick}
      disabled={confirm.disabled}
      loading={confirm.loading}
      loadingText={confirm.loadingText}
      className="max-md:h-[52px]">
      {confirm.label}
    </Button>
  </>
);
