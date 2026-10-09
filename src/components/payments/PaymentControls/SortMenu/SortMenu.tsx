import { ListFilter } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger
} from '~/components/ui/Menu';
import { pickSort, SORT_KEYS, SortKey, sortDirection, sortLabel } from '~/lib/payments';
import { SortProps } from '../sortProps';

/* Desktop: "Sort: Date ↑", opening Date, Amount and Name. Picking the current one turns it round. */
export const SortMenu = ({ sort, onSort }: SortProps) => (
  <Menu>
    <MenuTrigger>
      <Button className="text-[13px]">
        <ListFilter size={16} aria-hidden="true" />
        Sort: {sortLabel(sort)}
      </Button>
    </MenuTrigger>
    <MenuContent aria-label="Sort by" className="min-w-[180px]">
      <MenuRadioGroup value={sort.key}>
        {SORT_KEYS.map(option => (
          <MenuRadioItem
            key={option.key}
            value={option.key}
            // Radix only fires onValueChange for a new value, so the current one is handled here
            onSelect={() => onSort(pickSort(sort, option.key as SortKey))}
            indicator={sortDirection(sort)}>
            {option.label}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>
    </MenuContent>
  </Menu>
);
