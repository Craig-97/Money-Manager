import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from '@daypicker/react';
import { enGB } from '@daypicker/react/locale';
import * as Popover from '@radix-ui/react-popover';
import { popoverClasses } from '~/components/ui/popoverClasses';
import { cn } from '~/lib/cn';
import { formatPickerDate, parseIsoDate, toIsoDate } from '~/lib/dates';
import { fieldClasses } from '../fieldClasses';

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

const narrowWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'narrow' });

// The design's calendar: round 40px days, the picked day in the accent, today ringed
const dayStyles = {
  selected: '[&>button]:bg-accent [&>button]:text-on-accent [&>button]:hover:bg-accent',
  today: '[&>button]:shadow-[inset_0_0_0_1.5px_var(--border-strong)]',
  outside: '[&>button]:text-faint',
  disabled: '[&>button]:cursor-default [&>button]:opacity-35 [&>button]:hover:bg-transparent'
};

const navButtonClasses =
  'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-hover hover:text-text disabled:cursor-default disabled:opacity-35';

const CalendarChevron = ({ orientation }: { orientation?: 'left' | 'right' | 'up' | 'down' }) =>
  orientation === 'left' ? (
    <ChevronLeft size={18} aria-hidden="true" />
  ) : (
    <ChevronRight size={18} aria-hidden="true" />
  );

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

  const pick = (date: Date | undefined) => {
    if (!date) return;
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
          <DayPicker
            mode="single"
            required
            selected={selected}
            onSelect={pick}
            defaultMonth={selected ?? today}
            disabled={minDate ? { before: minDate } : undefined}
            locale={enGB}
            weekStartsOn={1}
            showOutsideDays
            fixedWeeks
            autoFocus
            formatters={{ formatWeekdayName: date => narrowWeekday.format(date) }}
            classNames={{
              root: 'relative',
              months: 'relative',
              month_caption: 'flex h-10 items-center justify-center',
              caption_label: 'text-sm font-bold',
              nav: 'absolute inset-x-0 top-0 flex justify-between',
              button_previous: navButtonClasses,
              button_next: navButtonClasses,
              month_grid: 'mt-1 w-full border-collapse',
              weekdays: '',
              weekday: 'py-1 text-center text-[11px] font-semibold text-muted',
              week: '',
              day: 'p-px',
              day_button:
                'num h-10 w-full cursor-pointer rounded-full text-[13px] font-semibold text-text hover:bg-hover',
              ...dayStyles
            }}
            components={{ Chevron: CalendarChevron }}
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
