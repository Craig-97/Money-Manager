import { Skeleton } from '~/components/ui/Skeleton';

const tileClasses = 'rounded-3xl border border-border bg-surface';

/* The recurring page's shape while the account loads */
export const RecurringSkeleton = () => (
  <section
    aria-busy="true"
    aria-label="Recurring payments"
    className="flex flex-col gap-3.5 md:gap-4">
    <span role="status" className="sr-only">
      Loading your account
    </span>

    <article
      aria-hidden="true"
      className={`${tileClasses} grid grid-cols-1 gap-5 p-5 md:p-7 min-[56.25rem]:grid-cols-3`}>
      {[0, 1, 2].map(index => (
        <div key={index} className={`flex flex-col gap-2.5 ${index === 2 ? 'max-md:hidden' : ''}`}>
          <Skeleton className="h-4 w-[130px]" />
          <Skeleton className="h-9 w-[150px] rounded-xl" />
          <Skeleton className="h-3.5 w-[190px] max-w-full" />
        </div>
      ))}
    </article>

    <div className="grid gap-4 min-[56.25rem]:grid-cols-2">
      {[0, 1].map(tile => (
        <article
          key={tile}
          aria-hidden="true"
          className={`${tileClasses} flex flex-col gap-3 p-3 md:p-5 ${tile === 1 ? 'max-md:hidden' : ''}`}>
          <Skeleton className="h-6 w-[170px]" />
          {[0, 1, 2].map(row => (
            <div key={row} className="flex min-h-14 items-center gap-3">
              <Skeleton className="size-10 rounded-[13px]" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-[45%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
              <Skeleton shape="pill" className="h-7 w-16" />
            </div>
          ))}
        </article>
      ))}
    </div>

    <article aria-hidden="true" className={`${tileClasses} flex flex-col gap-3.5 p-3 md:p-5`}>
      <div className="flex items-center justify-between gap-3 px-1">
        <Skeleton className="h-6 w-[110px]" />
        <Skeleton shape="pill" className="hidden h-11 w-[140px] md:block" />
      </div>
      <Skeleton shape="pill" className="h-12 w-full" />
      {[0, 1, 2, 3].map(index => (
        <div key={index} className="flex min-h-[66px] items-center gap-3 px-2">
          <Skeleton className="size-10 rounded-[13px]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-[55%]" />
            <Skeleton className="h-3 w-[35%]" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </article>
  </section>
);
