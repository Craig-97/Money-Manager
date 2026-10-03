import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { showToast } from '~/state/toast';
import { KitExample, KitSection } from './KitSection';

export const OverlaysSection = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState<string>();

  const showDeleted = () =>
    showToast({
      message: 'Note deleted',
      icon: <Trash2 />,
      action: { label: 'Undo', onClick: () => showToast({ message: 'Note restored' }) }
    });

  return (
    <KitSection title="Dialogs and toasts" source="Add payment dialog / sheet, notes snackbar">
      <KitExample label="Modal: a dialog on desktop, a bottom sheet below 768px">
        <Button variant="accent" onClick={() => setOpen(true)}>
          Open the payment dialog
        </Button>
      </KitExample>
      <KitExample label="Toasts">
        <Button onClick={() => showToast({ message: 'Payment added' })}>Show a toast</Button>
        <Button onClick={showDeleted}>Show one with Undo</Button>
      </KitExample>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Recurring payment"
        onBack={() => setOpen(false)}
        backLabel="Back to payment types"
        footer={
          <>
            <Button variant="dangerGhost">
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </Button>
            <span className="flex-1" />
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={() => setOpen(false)}>
              Save payment
            </Button>
          </>
        }>
        <div>
          <Label tone="muted" htmlFor="kit-dlg-name">
            Name
          </Label>
          <TextInput id="kit-dlg-name" placeholder="e.g. Netflix" />
        </div>
        <div className="grid gap-[18px] sm:grid-cols-2">
          <div>
            <Label tone="muted" htmlFor="kit-dlg-amount">
              Amount
            </Label>
            <AmountInput id="kit-dlg-amount" placeholder="0.00" />
          </div>
          <div>
            <Label tone="muted" htmlFor="kit-dlg-frequency">
              How often
            </Label>
            <Select
              id="kit-dlg-frequency"
              value={frequency}
              onValueChange={setFrequency}
              placeholder="Choose"
              options={[
                { value: 'WEEKLY', label: 'Every week' },
                { value: 'MONTHLY', label: 'Every month' },
                { value: 'ANNUALLY', label: 'Every year' }
              ]}
            />
          </div>
        </div>
        <div>
          <Label tone="muted" htmlFor="kit-dlg-date">
            First payment
          </Label>
          <DatePicker id="kit-dlg-date" value={date} onChange={setDate} />
        </div>
      </Modal>
    </KitSection>
  );
};
