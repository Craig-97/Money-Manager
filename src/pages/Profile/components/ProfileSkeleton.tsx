import { Skeleton } from '~/components/ui/Skeleton';

const tile = 'flex min-w-0 flex-col gap-5 rounded-3xl border border-border bg-surface p-5 md:p-6';

/* The profile's shape while the account loads */
export const ProfileSkeleton = () => (
  <div aria-busy="true" aria-label="Profile" className="contents">
    <span role="status" className="sr-only">
      Loading your profile
    </span>

    {/* The summary: a hero card on mobile, a plain tile on desktop */}
    <section
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-3xl bg-hero-bg p-5 md:hidden">
      <div className="flex items-center gap-4">
        <Skeleton tone="hero" shape="pill" className="size-16" />
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton tone="hero" className="h-6 w-[160px]" />
          <Skeleton tone="hero" className="h-3.5 w-[190px] max-w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2.5 border-t border-hero-chip pt-3.5">
        <Skeleton tone="hero" className="h-4 w-[150px]" />
        <Skeleton tone="hero" className="h-4 w-[60px]" />
      </div>
    </section>
    <section
      aria-hidden="true"
      className="hidden flex-wrap items-center gap-5 rounded-3xl border border-border bg-surface px-7 py-6 md:flex">
      <Skeleton shape="pill" className="size-16" />
      <div className="flex min-w-[200px] grow flex-col gap-2">
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[220px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton shape="pill" className="h-8 w-[150px]" />
        <Skeleton shape="pill" className="h-8 w-[130px]" />
      </div>
    </section>

    <div aria-hidden="true" className="-mx-4 flex gap-2 overflow-hidden px-4 py-1 md:hidden">
      {[0, 1, 2, 3, 4].map(index => (
        <Skeleton key={index} shape="pill" className="h-11 w-[84px]" />
      ))}
    </div>

    <div aria-hidden="true" className="grid items-start gap-6 wide:grid-cols-[232px_minmax(0,1fr)]">
      <div className="hidden flex-col gap-1 rounded-3xl border border-border bg-surface p-2.5 wide:flex">
        <Skeleton className="mx-3.5 mt-2 mb-1.5 h-3 w-[60px]" />
        {[0, 1, 2, 3, 4, 5].map(index => (
          <div key={index} className="flex h-11 items-center gap-3 px-3.5">
            <Skeleton className="size-[18px] rounded-md" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-3.5 md:gap-4">
        {[0, 1].map(index => (
          <div key={index} className={tile}>
            <div className="flex items-start gap-3.5">
              <Skeleton className="size-10 rounded-[14px]" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-[140px]" />
                <Skeleton className="h-3.5 w-[260px] max-w-full" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
              <Skeleton className="h-3.5 w-[160px] max-md:hidden" />
              <Skeleton shape="pill" className="h-11 w-full md:w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
