import { Check, Ellipsis, Landmark, PenLine, Percent, RefreshCw, Trash } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { Account, isInterestDue, isSpending } from '~/lib/accounts';
import { useAccountDialogStore } from '~/state/accountDialog';
import { useAccountQuickStore } from '~/state/accountQuick';

interface AccountMenuProps {
  account: Account;
  // More than one account to spend from, so pay can move to another
  several: boolean;
  today: Date;
  onCounts: (counts: boolean) => void;
}

/*
 * From the row's more button, in the order a debt's menu uses: Edit, Update balance, a savings
 * account's interest (or checking a payment that's waiting), make another spending account where
 * you get paid, count in or keep out of free to spend, and delete. Where pay
 * lands always counts and stays, so it has no more than Edit and Update balance.
 */
export const AccountMenu = ({ account, several, today, onCounts }: AccountMenuProps) => {
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const openDelete = useAccountDialogStore(s => s.openDelete);
  const openQuick = useAccountQuickStore(s => s.openFor);
  const fixed = account.paidInto;

  return (
    <Menu>
      <MenuTrigger>
        <IconButton aria-label={`More actions for ${account.name}`}>
          <Ellipsis size={18} aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent aria-label={`Actions for ${account.name}`}>
        <MenuItem icon={<PenLine size={16} />} onSelect={() => openEdit(account.id)}>
          Edit
        </MenuItem>
        <MenuItem
          icon={<RefreshCw size={16} />}
          onSelect={() => openQuick('balance', { accountId: account.id })}>
          Update balance
        </MenuItem>
        {isSpending(account) ? null : (
          <MenuItem
            icon={<Percent size={16} />}
            onSelect={() =>
              openQuick(isInterestDue(account.interest, today) ? 'check' : 'interest', {
                accountId: account.id
              })
            }>
            {isInterestDue(account.interest, today) ? 'Check interest' : 'Interest'}
          </MenuItem>
        )}
        {fixed ? null : (
          <>
            {isSpending(account) && several ? (
              <MenuItem
                icon={<Landmark size={16} />}
                onSelect={() => openQuick('paidInto', { accountId: account.id })}>
                Make where you get paid
              </MenuItem>
            ) : null}
            <MenuItem icon={<Check size={16} />} onSelect={() => onCounts(!account.counts)}>
              {account.counts ? 'Keep out of free to spend' : 'Count in free to spend'}
            </MenuItem>
            <MenuSeparator />
            <MenuItem danger icon={<Trash size={16} />} onSelect={() => openDelete(account.id)}>
              Delete
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
};
