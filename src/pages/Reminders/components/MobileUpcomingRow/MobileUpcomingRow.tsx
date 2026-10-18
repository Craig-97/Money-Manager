import { kindText, Reminder } from '~/lib/reminders';
import { RemindersPage } from '../../hooks';
import { DateBox } from '../DateBox';
import { ReminderAmount } from '../ReminderAmount';
import { UpcomingMenu } from '../UpcomingMenu';

/* One thing coming up, on mobile. Tapping it opens its actions. */
export const MobileUpcomingRow = ({
  reminder,
  page
}: {
  reminder: Reminder;
  page: RemindersPage;
}) => (
  <li>
    <UpcomingMenu reminder={reminder} page={page}>
      <button
        type="button"
        aria-label={`${reminder.name}, ${kindText(reminder)}, ${reminder.timing}. Actions`}
        className="flex min-h-[72px] w-full cursor-pointer items-center gap-3.5 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-hover aria-expanded:bg-hover">
        <DateBox date={reminder.date} today={page.today} accent={reminder.kind === 'payday'} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[15px] leading-[1.35] font-bold">{reminder.name}</span>
          <span className="text-xs leading-[1.35] font-semibold text-muted">
            {kindText(reminder)} · {reminder.timing.toLowerCase()}
          </span>
        </span>
        <ReminderAmount amount={reminder.amount} className="shrink-0 text-[15px]" />
      </button>
    </UpcomingMenu>
  </li>
);
