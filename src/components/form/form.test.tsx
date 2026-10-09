import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { PasswordInput } from './PasswordInput';
import { Select } from './Select';

describe('Checkbox', () => {
  it('shows part of a group selected', () => {
    const { rerender } = render(<Checkbox aria-label="Select all" indeterminate />);
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all' });

    expect(checkbox.indeterminate).toBe(true);

    rerender(<Checkbox aria-label="Select all" indeterminate={false} />);
    expect(checkbox.indeterminate).toBe(false);
  });

  it('passes its ref through', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox aria-label="Pick" ref={ref} />);

    expect(ref.current).toBe(screen.getByRole('checkbox'));
  });
});

describe('PasswordInput', () => {
  it('shows and hides what has been typed', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" defaultValue="secret1" />);
    const input = screen.getByLabelText('Password');

    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Every week' },
  { value: 'MONTHLY', label: 'Every month' }
];

describe('Select', () => {
  it('shows the placeholder, then the chosen option', async () => {
    const user = userEvent.setup();
    const ControlledSelect = () => {
      const [value, setValue] = useState<string>();
      return (
        <Select
          aria-label="How often"
          value={value}
          onValueChange={setValue}
          options={FREQUENCIES}
          placeholder="Choose how often"
        />
      );
    };
    render(<ControlledSelect />);
    const trigger = screen.getByRole('combobox', { name: 'How often' });

    expect(trigger).toHaveTextContent('Choose how often');

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Every month' }));

    expect(trigger).toHaveTextContent('Every month');
  });

  it('can be chosen with the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        aria-label="How often"
        value="WEEKLY"
        onValueChange={onValueChange}
        options={FREQUENCIES}
      />
    );

    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('MONTHLY');
  });
});

describe('DatePicker', () => {
  // A fixed today away from the months the tests open, as the calendar labels today's date
  // differently ("Today, Friday, 9 October 2026"). Only Date is faked.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-15T09:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  const ControlledDatePicker = ({ initial = '', min }: { initial?: string; min?: string }) => {
    const [value, setValue] = useState(initial);
    return (
      <>
        <DatePicker aria-label="Due date" value={value} onChange={setValue} min={min} />
        <output>{value}</output>
      </>
    );
  };

  it('opens on the chosen month and picks a day as YYYY-MM-DD', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker initial="2026-10-28" />);
    const trigger = screen.getByRole('button', { name: 'Due date' });

    expect(trigger).toHaveTextContent('Wed 28 Oct 2026');

    await user.click(trigger);
    expect(await screen.findByText('October 2026')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thursday, 15 October 2026' }));

    expect(screen.getByRole('status')).toHaveTextContent('2026-10-15');
    expect(trigger).toHaveTextContent('Thu 15 Oct 2026');
    expect(screen.queryByText('October 2026')).not.toBeInTheDocument();
  });

  it("doesn't allow days before the earliest date", async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker initial="2026-10-20" min="2026-10-10" />);

    await user.click(screen.getByRole('button', { name: 'Due date' }));

    expect(await screen.findByRole('button', { name: 'Friday, 9 October 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saturday, 10 October 2026' })).toBeEnabled();
  });

  it('picks today from the footer', async () => {
    const user = userEvent.setup();
    render(<ControlledDatePicker />);

    expect(screen.getByRole('button', { name: 'Due date' })).toHaveTextContent('Choose a date');

    await user.click(screen.getByRole('button', { name: 'Due date' }));
    await user.click(await screen.findByRole('button', { name: 'Today' }));

    const today = new Date();
    const iso = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
    expect(screen.getByRole('status')).toHaveTextContent(iso);
  });
});
