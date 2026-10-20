import { Check, Ellipsis, Landmark, PenLine, Trash } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { Account, isSpending } from '~/lib/accounts';
import { useAccountDialogStore } from '~/state/accountDialog';

interface AccountMenuProps {
  account: Account;
  // More than one account to spend from, so pay can move to another
  several: boolean;
  onCounts: (counts: boolean) => void;
}

/*
 * Edit, make another spending account where you get paid, count in or keep out of free to spend,
 * and delete, from the row's more button. Where pay lands always counts and stays, so it only has
 * Edit.
 */
export const AccountMenu = ({ account, several, onCounts }: AccountMenuProps) => {
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const openDelete = useAccountDialogStore(s => s.openDelete);
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
        {fixed ? null : (
          <>
            {isSpending(account) && several ? (
              <MenuItem
                icon={<Landmark size={16} />}
                onSelect={() => openEdit(account.id, { paidInto: true })}>
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
