import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { useBackToAccount } from '~/hooks/useBackToAccount';
import { Account, paidIntoAccountOf } from '~/lib/accounts';
import { PayCycle } from '~/lib/payday';
import { formatShortDate } from '~/lib/payments';
import { useAccountQuickStore } from '~/state/accountQuick';
import { AccountSummary } from '../AccountSummary';

interface PaidIntoDialogProps {
  accounts: readonly Account[];
  today: Date;
  cycle: PayCycle;
  onConfirm: (account: Account) => Promise<boolean>;
}

/* Make where you get paid: what moving pay to this account changes, before it does */
export const PaidIntoDialog = ({ accounts, today, cycle, onConfirm }: PaidIntoDialogProps) => {
  const { open, accountId, close } = useAccountQuickStore(
    useShallow(s => ({ open: s.open === 'paidInto', accountId: s.accountId, close: s.close }))
  );
  const [saving, setSaving] = useState(false);
  const account = accounts.find(item => item.id === accountId);
  const back = useBackToAccount(account?.id);
  if (!account) return null;
  const now = paidIntoAccountOf(accounts);

  const confirm = async () => {
    setSaving(true);
    const saved = await onConfirm(account);
    setSaving(false);
    if (saved) close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title="Where you get paid"
      onBack={back}
      backLabel={`Back to ${account.name}`}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => void confirm()}
            loading={saving}
            className="max-md:h-[52px]">
            Move my pay here
          </Button>
        </>
      }>
      <AccountSummary account={account} today={today} named />
      <p className="flex items-start gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
        <ArrowRight size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Your pay goes into {account.name} from {formatShortDate(cycle.end, today)}.
          {now ? ` ${now.name} stops being where you get paid, and` : ' From then,'} payments that
          don’t name an account come out of {account.name}.
        </span>
      </p>
    </Modal>
  );
};
