import { Modal } from '~/components/ui/Modal';
import { formatShortDate } from '~/lib/payments';
import { PaydayOverride } from '../../../hooks';
import { PaydayPickerActions } from '../PaydayPickerActions';
import { PaydayPickerBody } from '../PaydayPickerBody';

/* The whole picker as a dialog: centred on desktop, a bottom sheet on mobile */
export const PaydayOverrideDialog = ({ override }: { override: PaydayOverride }) => (
  <Modal
    open={override.open}
    onOpenChange={override.setOpen}
    title="Change this payday"
    description={`Just this payday. Usually ${formatShortDate(override.usual)}.`}
    footer={<PaydayPickerActions override={override} onCancel={() => override.setOpen(false)} />}>
    <p className="-mt-1 pl-1 text-[13px] font-medium text-muted md:pl-0">
      Just this one. Usually {formatShortDate(override.usual)}.
    </p>
    <PaydayPickerBody override={override} />
  </Modal>
);
