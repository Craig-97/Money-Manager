import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, Matcher } from '@daypicker/react';
import { enGB } from '@daypicker/react/locale';
import { cn } from '~/lib/cn';

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  defaultMonth?: Date;
  // Days that can't be picked
  disabled?: Matcher | Matcher[];
  // Extra days to mark, each styled by the class of the same name in `modifierClasses`
  modifiers?: Record<string, Matcher | Matcher[]>;
  modifierClasses?: Record<string, string>;
  autoFocus?: boolean;
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

/* A month calendar for picking one day */
export const Calendar = ({
  selected,
  onSelect,
  defaultMonth,
  disabled,
  modifiers,
  modifierClasses,
  autoFocus,
  className
}: CalendarProps) => (
  <DayPicker
    mode="single"
    required
    selected={selected}
    onSelect={date => date && onSelect(date)}
    defaultMonth={defaultMonth ?? selected ?? new Date()}
    disabled={disabled}
    modifiers={modifiers}
    modifiersClassNames={modifierClasses}
    locale={enGB}
    weekStartsOn={1}
    showOutsideDays
    fixedWeeks
    autoFocus={autoFocus}
    formatters={{ formatWeekdayName: date => narrowWeekday.format(date) }}
    classNames={{
      root: cn('relative', className),
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
);
