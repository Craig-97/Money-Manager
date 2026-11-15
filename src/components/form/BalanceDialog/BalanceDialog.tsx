import { ReactNode } from 'react';
import { Modal, ModalActions } from '../../ui';
import { AmountInput } from '../AmountInput';
import { FieldError } from '../FieldError';
import { FieldHint } from '../FieldHint';
import { Label } from '../Label';

// What a balance dialog's hook gives it
export interface BalanceForm {
  open: boolean;
  draft: string;
  setDraft: (draft: string) => void;
  error: string | undefined;
  canSave: boolean;
  saving: boolean;
  close: () => void;
  save: () => void;
}

interface BalanceDialogProps {
  form: BalanceForm;
  // The balance field's id, which the error and hint ids build on
  id: string;
  // What the balance is for, at the top
  summary: ReactNode;
  // Under the field: where to find the balance
  hint: string;
  // Back to the account or debt it was opened from, if it was
  onBack?: () => void;
  backLabel?: string;
  // Under the field: what the new balance changes
  children?: ReactNode;
}

/*
 * Update balance: what an account or debt has now, typed in from the bank or a statement. A small
 * dialog on desktop, a sheet on a phone; Edit has everything else.
 */
export const BalanceDialog = ({
  form,
  id,
  summary,
  hint,
  onBack,
  backLabel,
  children
}: BalanceDialogProps) => (
  <Modal
    open={form.open}
    onOpenChange={next => (next ? undefined : form.close())}
    title="Update balance"
    onBack={onBack}
    backLabel={backLabel}
    initialFocusId={id}
    footer={
      <ModalActions
        cancel={{ onClick: form.close }}
        confirm={{
          label: 'Save balance',
          onClick: form.save,
          disabled: !form.canSave,
          loading: form.saving
        }}
      />
    }>
    {summary}
    <div>
      <Label tone="muted" htmlFor={id}>
        Balance now
      </Label>
      <AmountInput
        id={id}
        value={form.draft}
        onChange={event => form.setDraft(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') form.save();
        }}
        placeholder="0.00"
        invalid={!!form.error}
        aria-describedby={form.error ? `${id}-error` : `${id}-hint`}
      />
      {form.error ? (
        <FieldError id={`${id}-error`}>{form.error}</FieldError>
      ) : (
        <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      )}
    </div>
    {children}
  </Modal>
);
