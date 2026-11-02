import { ArrowLeftRight, Landmark, PenLine, RefreshCw } from 'lucide-react';
import { ActionRow } from '~/components/ui/ActionRow';
import { ActionRows } from '~/components/ui/ActionRows';
import { ActionTile } from '~/components/ui/ActionTile';
import { ActionTiles } from '~/components/ui/ActionTiles';
import { Modal } from '~/components/ui/Modal';
import { Switch } from '~/components/ui/Switch';
import { updatedText } from '~/lib/accounts';
import { AccountSummary } from '../AccountSummary';
import { useAccountSheet } from './useAccountSheet';

/*
 * An account's view, as a debt's is: its balance and whether it counts in free to spend, then its
 * small dialogs as tiles, and Edit account for the full form. A dialog on desktop, a sheet on a
 * phone, from its name on Accounts.
 */
export const AccountSheet = () => {
  const sheet = useAccountSheet();
  if (!sheet.account) return null;
  const { account } = sheet;

  return (
    <Modal
      open={sheet.open}
      onOpenChange={next => (next ? undefined : sheet.close())}
      title={account.name}>
      <AccountSummary account={account} today={sheet.today}>
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span id="account-view-counts" className="text-sm font-bold">
              Count in free to spend
            </span>
            <span className="text-xs leading-[1.4] font-semibold text-muted">
              {sheet.countsLocked
                ? 'Where you get paid, so it always counts'
                : account.counts
                  ? 'Adds to the bank balance on your dashboard'
                  : 'Kept out of free to spend'}
            </span>
          </span>
          <Switch
            checked={account.counts}
            disabled={sheet.countsLocked}
            onCheckedChange={sheet.setCounts}
            aria-labelledby="account-view-counts"
            className="disabled:cursor-default disabled:opacity-55"
          />
        </div>
      </AccountSummary>
      <ActionTiles>
        <ActionTile
          icon={<RefreshCw size={20} />}
          label="Update balance"
          detail={updatedText(account, sheet.today)}
          onClick={sheet.updateBalance}
        />
        {sheet.canBePaidInto ? (
          <ActionTile
            icon={<Landmark size={20} />}
            label="Make where you get paid"
            onClick={sheet.makePaidInto}
          />
        ) : null}
      </ActionTiles>
      <ActionRows>
        {sheet.canMoveInto ? (
          <ActionRow icon={<ArrowLeftRight size={18} />} onClick={sheet.moveInto} chevron>
            Move money into {account.name}
          </ActionRow>
        ) : null}
        <ActionRow icon={<PenLine size={18} />} onClick={sheet.edit} chevron>
          Edit account
        </ActionRow>
      </ActionRows>
    </Modal>
  );
};
