import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { Radio } from '~/components/form/Radio';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { KitExample, KitSection } from './KitSection';

const ROWS = ['Mortgage', 'Netflix', 'Gym'];

export const ChoicesSection = () => {
  const [selected, setSelected] = useState<string[]>(['Netflix']);
  const [tab, setTab] = useState('upcoming');
  const [range, setRange] = useState('12');
  const [theme, setTheme] = useState('dark');
  const [region, setRegion] = useState('england');

  const allSelected = selected.length === ROWS.length;
  const toggle = (row: string) =>
    setSelected(rows => (rows.includes(row) ? rows.filter(r => r !== row) : [...rows, row]));

  return (
    <KitSection title="Choices" source="Payment lists, setup, forecast range, theme switch">
      <KitExample label="Checkboxes: select all shows a dash when some are selected">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm font-bold">
            <CheckboxHitArea>
              <Checkbox
                aria-label="Select all payments"
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                onChange={() => setSelected(allSelected ? [] : ROWS)}
              />
            </CheckboxHitArea>
            Select all
          </div>
          {ROWS.map(row => (
            <label
              key={row}
              className="flex cursor-pointer items-center gap-1 text-sm font-semibold">
              <span className="inline-flex size-11 items-center justify-center">
                <Checkbox checked={selected.includes(row)} onChange={() => toggle(row)} />
              </span>
              {row}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3 pt-3">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Checkbox size="md" defaultChecked />
            Mobile size (22px)
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Checkbox disabled />
            Disabled
          </label>
        </div>
      </KitExample>

      <KitExample label="Radios">
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Bank holiday region</legend>
          {[
            ['england', 'England and Wales'],
            ['scotland', 'Scotland'],
            ['ni', 'Northern Ireland']
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <Radio
                name="kit-region"
                value={value}
                checked={region === value}
                onChange={() => setRegion(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </KitExample>

      <KitExample label="Segmented: sm with counts (dashboard tabs)">
        <SegmentedControl
          aria-label="Payments"
          value={tab}
          onValueChange={setTab}
          options={[
            { value: 'upcoming', label: 'Upcoming', count: 4 },
            { value: 'recurring', label: 'Recurring', count: 12 },
            { value: 'one-off', label: 'One-off', count: 2 }
          ]}
        />
      </KitExample>
      <KitExample label="Segmented: md with icons, full width (theme switch)">
        <div className="w-64">
          <SegmentedControl
            aria-label="Theme"
            size="md"
            fullWidth
            value={theme}
            onValueChange={setTheme}
            options={[
              { value: 'light', label: 'Light', icon: <Sun size={15} aria-hidden="true" /> },
              { value: 'dark', label: 'Dark', icon: <Moon size={15} aria-hidden="true" /> }
            ]}
          />
        </div>
      </KitExample>
      <KitExample label="Segmented: lg (forecast range)">
        <SegmentedControl
          aria-label="Forecast range"
          size="lg"
          value={range}
          onValueChange={setRange}
          options={[
            { value: '6', label: '6 months' },
            { value: '12', label: '1 year' },
            { value: '24', label: '2 years' }
          ]}
        />
      </KitExample>
    </KitSection>
  );
};
