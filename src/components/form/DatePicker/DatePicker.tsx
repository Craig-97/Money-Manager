import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { popoverClasses } from '~/components/ui/popoverClasses';
import { cn } from '~/lib/cn';
import { formatPickerDate, parseIsoDate, toIsoDate } from '~/lib/dates';
import { fieldClasses } from '../fieldClasses';
import { Calendar } from './Calendar';

interface DatePickerProps {
  // 'YYYY-MM-DD', or '' for no date
  value: string;
  onChange: (value: string) => void;
  // The earliest date that can be picked, 'YYYY-MM-DD'
  min?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  className?: string;
}

const footerButtonClasses =
  'h-10 cursor-pointer rounded-full px-3 text-[13px] font-semibold hover:bg-hover disabled:cursor-default disabled:opacity-35';

/* A date field that opens a calendar */
export const DatePicker = ({
  value,
  onChange,
  min,
  placeholder = 'Choose a date',
  invalid = false,
  disabled,
  id,
  className,
  ...aria
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const minDate = parseIsoDate(min);
  const today = new Date();
  const todayAllowed = !minDate || toIsoDate(today) >= toIsoDate(minDate);

  const pick = (date: Date) => {
    onChange(toIsoDate(date));
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldClasses({ invalid }),
          'cursor-pointer justify-between gap-2 text-left outline-none disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        {...aria}>
        <span className={cn('min-w-0 truncate', !selected && 'text-muted')}>
          {selected ? formatPickerDate(selected) : placeholder}
        </span>
        <CalendarDays size={17} className="shrink-0 text-muted" aria-hidden="true" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className={cn(popoverClasses, 'w-[300px] max-w-[calc(100vw-32px)] rounded-[18px] p-3')}>
          <Calendar
            selected={selected}
            onSelect={pick}
            defaultMonth={selected ?? today}
            disabled={minDate ? { before: minDate } : undefined}
            autoFocus
          />
          <div className="mt-1.5 flex justify-between border-t border-border pt-1.5">
            <button
              type="button"
              disabled={!todayAllowed}
              onClick={() => pick(today)}
              className={cn(footerButtonClasses, 'text-accent-text')}>
              Today
            </button>
            <Popover.Close className={cn(footerButtonClasses, 'text-muted')}>Close</Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
