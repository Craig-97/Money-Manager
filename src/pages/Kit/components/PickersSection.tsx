import { useState } from 'react';
import { CheckCheck, MoreHorizontal, Pencil, SkipForward, Trash2 } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '~/components/ui/Menu';
import { showToast } from '~/state/toast';
import { KitExample, KitSection } from './KitSection';

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Every week' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Every month' },
  { value: 'QUARTERLY', label: 'Every 3 months' },
  { value: 'ANNUALLY', label: 'Every year' }
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

export const PickersSection = () => {
  const [frequency, setFrequency] = useState<string>();
  const [sort, setSort] = useState('newest');
  const [date, setDate] = useState('2026-10-28');
  const [emptyDate, setEmptyDate] = useState('');

  return (
    <KitSection title="Pickers and menus" source="Payment dialog, notes sort, payment row menu">
      <div className="grid gap-6 md:grid-cols-2">
        <KitExample label="Select (field)">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-frequency">
              How often
            </Label>
            <Select
              id="kit-frequency"
              value={frequency}
              onValueChange={setFrequency}
              options={FREQUENCIES}
              placeholder="Choose how often"
            />
          </div>
        </KitExample>
        <KitExample label="Select with an error">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-frequency-error">
              How often
            </Label>
            <Select
              id="kit-frequency-error"
              value={undefined}
              onValueChange={() => undefined}
              options={FREQUENCIES}
              invalid
              aria-describedby="kit-frequency-error-msg"
            />
            <FieldError id="kit-frequency-error-msg">Choose how often it's paid</FieldError>
          </div>
        </KitExample>
        <KitExample label="Date picker">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-date">
              First payment
            </Label>
            <DatePicker id="kit-date" value={date} onChange={setDate} />
          </div>
        </KitExample>
        <KitExample label="Date picker, empty, no dates before today">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-date-empty">
              Due date
            </Label>
            <DatePicker
              id="kit-date-empty"
              value={emptyDate}
              onChange={setEmptyDate}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </KitExample>
        <KitExample label="Select (pill)">
          <Select
            variant="pill"
            aria-label="Sort notes"
            value={sort}
            onValueChange={setSort}
            options={SORTS}
          />
        </KitExample>
        <KitExample label="Menu">
          <Menu>
            <MenuTrigger>
              <IconButton aria-label="More actions for Netflix" variant="outline">
                <MoreHorizontal size={18} aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                icon={<CheckCheck size={18} />}
                onSelect={() => showToast({ message: 'Netflix marked as paid' })}>
                Mark as paid
              </MenuItem>
              <MenuItem icon={<SkipForward size={18} />}>Skip this time</MenuItem>
              <MenuItem icon={<Pencil size={18} />}>Edit</MenuItem>
              <MenuItem icon={<Trash2 size={18} />} danger>
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        </KitExample>
      </div>
    </KitSection>
  );
};
