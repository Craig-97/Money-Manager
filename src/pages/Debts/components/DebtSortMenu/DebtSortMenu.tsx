import { ListFilter } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger
} from '~/components/ui/Menu';
import { DEBT_SORTS, DebtSort, sortLabelOf } from '../../debtsModel';

interface DebtSortMenuProps {
  sort: DebtSort;
  onSort: (sort: DebtSort) => void;
}

/* Desktop: the debts' order, as the dashboard's sort menu */
export const DebtSortMenu = ({ sort, onSort }: DebtSortMenuProps) => (
  <Menu>
    <MenuTrigger>
      <Button className="text-[13px]">
        <ListFilter size={16} aria-hidden="true" />
        {sortLabelOf(sort)}
      </Button>
    </MenuTrigger>
    <MenuContent aria-label="Sort by" className="min-w-[180px]">
      <MenuRadioGroup value={sort} onValueChange={value => onSort(value as DebtSort)}>
        {DEBT_SORTS.map(option => (
          <MenuRadioItem key={option.value} value={option.value} indicator="✓">
            {option.label}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
    </MenuContent>
  </Menu>
);
