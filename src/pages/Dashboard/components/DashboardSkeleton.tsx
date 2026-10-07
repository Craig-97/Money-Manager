import { Skeleton } from '~/components/ui/Skeleton';

const heroChip = 'flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-chip px-3.5 py-3';

/* The dashboard's shape while the account loads */
export const DashboardSkeleton = () => (
  <section
    aria-busy="true"
    aria-label="Overview"
    className="grid gap-3.5 md:gap-4 wide:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
    <span role="status" className="sr-only">
      Loading your account
    </span>

    <article
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-3xl bg-hero-bg p-[22px] md:gap-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <Skeleton tone="hero" className="h-4 w-[90px] md:h-5 md:w-[110px]" />
        <Skeleton tone="hero" shape="pill" className="h-7 w-[130px] md:h-[35px] md:w-[150px]" />
      </div>
      <div>
        <Skeleton
          tone="hero"
          className="h-14 w-[220px] max-w-full rounded-[14px] md:h-20 md:w-[280px] md:rounded-2xl"
        />
        <Skeleton
          tone="hero"
          className="mt-2.5 h-5 w-[180px] max-w-full md:mt-3.5 md:h-[22px] md:w-[240px]"
        />
      </div>
      <div className="mt-auto hidden grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)] gap-2 md:grid">
        <div className={heroChip}>
          <Skeleton tone="hero" className="h-5 w-[70px]" />
          <Skeleton tone="hero" className="h-6 w-[90px]" />
        </div>
        <span />
        <div className={heroChip}>
          <Skeleton tone="hero" className="h-5 w-[70px]" />
          <Skeleton tone="hero" className="h-6 w-[90px]" />
        </div>
        <span />
        <div className={heroChip}>
          <Skeleton tone="hero" className="h-5 w-[70px]" />
          <Skeleton tone="hero" className="h-6 w-[90px]" />
        </div>
      </div>
    </article>

    <article
      aria-hidden="true"
      className="hidden flex-col gap-[22px] rounded-3xl border border-border bg-surface p-7 md:flex">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[110px]" />
        <Skeleton shape="pill" className="h-[35px] w-[90px]" />
      </div>
      <Skeleton className="h-16 w-[150px] rounded-2xl" />
      <Skeleton shape="pill" className="h-2.5 w-full" />
      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-5">
        <Skeleton className="h-6 w-[120px]" />
        <Skeleton className="h-6 w-[120px]" />
      </div>
    </article>

    <article
      aria-hidden="true"
      className="col-span-full flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-3 md:p-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <Skeleton className="h-6 w-[110px]" />
        <Skeleton shape="pill" className="hidden h-11 w-[140px] md:block" />
      </div>
      <Skeleton shape="pill" className="h-[54px] w-full md:h-12 md:w-[300px]" />
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
