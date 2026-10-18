import { Modal } from '~/components/ui/Modal';
import { RemindersPage } from '../../hooks';
import { HowYoullHear } from '../HowYoullHear';
import { UsualTiming } from '../UsualTiming';

interface SettingsSheetProps {
  page: RemindersPage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* On mobile, the usual timing and how reminders reach you, from the header's settings button */
export const SettingsSheet = ({ page, open, onOpenChange }: SettingsSheetProps) => (
  <Modal open={open} onOpenChange={onOpenChange} title="Reminder settings">
    <section aria-labelledby="sheet-timing">
      <h2 id="sheet-timing" className="mb-3 text-base font-extrabold">
        Usual timing
      </h2>
      <UsualTiming page={page} />
    </section>
    <section aria-labelledby="sheet-hear" className="border-t border-border pt-4">
      <h2 id="sheet-hear" className="mb-2 text-base font-extrabold">
        How you’ll hear
      </h2>
      <HowYoullHear />
    </section>
  </Modal>
);
