import { Skeleton } from '~/components/ui/Skeleton';

/* The accounts page's shape while the budget loads */
export const AccountsSkeleton = () => (
  <section aria-busy="true" aria-label="Accounts" className="flex flex-col gap-3.5 md:gap-4">
    <span role="status" className="sr-only">
      Loading your budget
    </span>
    <div aria-hidden="true" className="h-[220px] rounded-3xl bg-hero-bg opacity-55 md:h-[300px]" />
    <article
      aria-hidden="true"
      className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5 md:p-6">
      <Skeleton className="h-6 w-[140px]" />
      {[0, 1, 2].map(row => (
        <div key={row} className="flex min-h-14 items-center justify-between gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[55%]" />
          </div>
          <Skeleton className="h-5 w-[80px]" />
        </div>
      ))}
    </article>
  </section>
);
