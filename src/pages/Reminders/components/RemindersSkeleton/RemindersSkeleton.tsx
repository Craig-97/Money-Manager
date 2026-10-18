import { Skeleton } from '~/components/ui/Skeleton';
import { cn } from '~/lib/cn';

const TITLE_WIDTHS = ['w-[62%]', 'w-[48%]', 'w-[70%]', 'w-[54%]'];

/* The page's shape while the account loads */
export const RemindersSkeleton = () => (
  <section aria-label="Reminders" aria-busy="true" className="flex flex-col gap-4">
    <span role="status" className="sr-only">
      Loading your reminders
    </span>
    <Skeleton shape="pill" className="h-12 w-full md:w-[260px]" />
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-3">
      {TITLE_WIDTHS.map(width => (
        <div key={width} className="flex items-center gap-3.5 p-2.5">
          <Skeleton shape="pill" className="size-11" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton shape="pill" className={cn('h-3.5', width)} />
            <Skeleton shape="pill" className="h-3 w-[30%]" />
          </div>
        </div>
      ))}
    </div>
  </section>
);
