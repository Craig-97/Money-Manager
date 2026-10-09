import { Skeleton } from '~/components/ui/Skeleton';
import { cn } from '~/lib/cn';
import { noteGridClasses } from '../noteGridClasses';

// Second and third line widths, so the placeholders don't all look the same
const SKELETON_LINES = [
  ['w-[72%]', 'w-[46%]'],
  ['w-[56%]', 'w-[38%]'],
  ['w-[80%]', 'w-[46%]'],
  ['w-[64%]', 'w-[38%]'],
  ['w-[76%]', 'w-[46%]'],
  ['w-[52%]', 'w-[38%]']
];

/* The board's shape while the account loads */
export const NotesSkeleton = () => (
  <section aria-label="Notes" aria-busy="true" className={noteGridClasses}>
    <span role="status" className="sr-only">
      Loading your notes
    </span>
    {SKELETON_LINES.map(([second, third]) => (
      <div
        key={second}
        aria-hidden="true"
        className="flex min-h-[200px] flex-col gap-4 rounded-[22px] border border-border bg-surface p-[18px] md:h-[190px] md:min-h-0 md:rounded-3xl md:p-[22px]">
        <div className="flex grow flex-col gap-3 pt-[5px]">
          <Skeleton shape="pill" className="h-3.5 w-[88%]" />
          <Skeleton shape="pill" className={cn('h-3.5', second)} />
          <Skeleton shape="pill" className={cn('h-3.5', third)} />
        </div>
        <div className="flex h-11 items-center justify-between">
          <span className="flex items-center gap-2">
            <Skeleton shape="pill" className="size-2" />
            <Skeleton shape="pill" className="h-2.5 w-[88px]" />
          </span>
          <span className="flex gap-3.5 pr-1.5">
            <Skeleton className="size-[18px]" />
            <Skeleton className="size-[18px]" />
          </span>
        </div>
      </div>
    ))}
  </section>
);
