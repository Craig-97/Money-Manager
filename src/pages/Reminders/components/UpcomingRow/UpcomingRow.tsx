import { MoreHorizontal } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { kindText, Reminder } from '~/lib/reminders';
import { RemindersPage } from '../../hooks';
import { DateBox } from '../DateBox';
import { ReminderAmount } from '../ReminderAmount';
import { UpcomingMenu } from '../UpcomingMenu';

/* One thing coming up, on desktop: its date, what it is, when it reminds, the money and a menu */
export const UpcomingRow = ({ reminder, page }: { reminder: Reminder; page: RemindersPage }) => (
  <li className="grid min-h-[74px] grid-cols-[52px_minmax(0,1.3fr)_minmax(0,1fr)_120px_44px] items-center gap-x-3 rounded-2xl px-2 transition-colors hover:bg-hover">
    <DateBox date={reminder.date} today={page.today} accent={reminder.kind === 'payday'} />
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span
        title={reminder.name}
        className="line-clamp-2 max-w-full text-[15px] leading-[1.35] font-bold">
        {reminder.name}
      </span>
      <span className="inline-flex h-[22px] items-center rounded-full bg-surface-2 px-2.5 text-[11px] font-bold text-muted">
        {kindText(reminder)}
      </span>
    </span>
    <span
      className={cn(
        'line-clamp-2 text-sm leading-[1.35] font-semibold',
        reminder.firesOn ? 'text-muted' : 'text-faint'
      )}>
      {reminder.timing}
    </span>
    <span className="text-right text-[15px]">
      <ReminderAmount amount={reminder.amount} />
    </span>
    <UpcomingMenu reminder={reminder} page={page}>
      <IconButton aria-label={`More actions for ${reminder.name}`}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </IconButton>
    </UpcomingMenu>
  </li>
);
