import { useReminders } from '~/hooks/useReminders';

/* How many reminders are new, beside Reminders */
export const SidebarReminderCount = ({ expanded }: { expanded: boolean }) => {
  const { unread } = useReminders();
  if (!unread) return null;
  return expanded ? (
    <span className="ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-expense px-1.5 num text-[11px] font-extrabold text-white">
      {unread}
      <span className="sr-only"> new</span>
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="absolute top-3 right-4 size-2.5 rounded-full border-2 border-surface bg-expense"
    />
  );
};
