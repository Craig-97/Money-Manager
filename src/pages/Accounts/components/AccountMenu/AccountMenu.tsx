import { Check, Ellipsis, PenLine, Trash } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { Account, isCurrent } from '~/lib/accounts';
import { useAccountDialogStore } from '~/state/accountDialog';

interface AccountMenuProps {
  account: Account;
  onCounts: (counts: boolean) => void;
}

/*
 * Edit, count in or keep out of free to spend, and delete, from the row's more button. The current
 * account always counts and stays, so it only has Edit.
 */
export const AccountMenu = ({ account, onCounts }: AccountMenuProps) => {
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const openDelete = useAccountDialogStore(s => s.openDelete);
  const fixed = isCurrent(account);

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
