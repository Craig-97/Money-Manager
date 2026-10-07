import { Skeleton } from '~/components/ui/Skeleton';
import { cn } from '~/lib/cn';

const card = 'flex min-w-0 flex-col rounded-3xl border border-border bg-surface';

/* The forecast's shape while the account loads */
export const ForecastSkeleton = () => (
  <div aria-busy="true" aria-label="Forecast" className="contents">
    <span role="status" className="sr-only">
      Loading your forecast
    </span>

    <section aria-hidden="true" className="grid grid-cols-2 gap-2.5 md:gap-4 wide:grid-cols-4">
      {[0, 1, 2].map(index => (
        <div key={index} className={cn(card, 'gap-2.5 p-5 md:gap-4 md:p-6')}>
          <div className="flex items-center gap-2.5">
            <Skeleton className="hidden size-9 rounded-xl md:block" />
            <Skeleton className="h-4 w-[90px]" />
          </div>
          <Skeleton className="h-7 w-[100px] md:h-9 md:w-[140px]" />
          <Skeleton className="h-3.5 w-[80px] md:mt-auto md:w-[130px]" />
        </div>
      ))}
      <div className="flex flex-col gap-2.5 rounded-3xl bg-hero-bg p-5 md:gap-4 md:p-6">
        <Skeleton tone="hero" className="h-4 w-[90px]" />
        <Skeleton tone="hero" className="h-7 w-[100px] md:h-9 md:w-[140px]" />
        <Skeleton tone="hero" className="h-3.5 w-[80px] md:mt-auto md:w-[150px]" />
      </div>
    </section>

    <section aria-hidden="true" className="grid gap-3.5 md:gap-4 wide:grid-cols-3">
      <div className={cn(card, 'gap-3.5 p-5 md:gap-[18px] md:p-6')}>
        <Skeleton className="h-5 w-[130px]" />
        <Skeleton className="h-16 w-full rounded-[18px]" />
        <Skeleton shape="pill" className="h-2 w-full" />
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {[0, 1, 2, 3].map(index => (
            <Skeleton key={index} shape="pill" className="h-11 w-[72px]" />
          ))}
        </div>
        <Skeleton className="h-[60px] w-full rounded-[14px] md:rounded-2xl" />
      </div>
      <div className={cn(card, 'gap-3.5 p-5 md:gap-5 md:p-6 wide:col-span-2')}>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-3.5 w-[220px] max-w-full" />
        </div>
        <Skeleton className="h-[190px] w-full rounded-2xl md:h-[300px]" />
        <Skeleton className="h-12 w-full rounded-[14px] md:mt-auto md:rounded-2xl" />
      </div>
    </section>

    <section
      aria-hidden="true"
      className={cn(card, 'gap-3 px-4 pt-5 pb-4 md:px-5 md:pt-6 md:pb-5')}>
      <div className="flex items-center justify-between gap-4 px-1 md:pb-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-[130px]" />
          <Skeleton className="hidden h-3.5 w-[200px] md:block" />
        </div>
        <Skeleton shape="pill" className="h-11 w-[160px] max-md:hidden" />
      </div>
      {[0, 1, 2, 3, 4, 5].map(index => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3 px-1 py-3',
            index > 0 && 'border-t border-border'
          )}>
          <Skeleton className="h-4 w-[70px]" />
          <Skeleton className="ml-auto h-4 w-[60px] max-md:hidden" />
          <Skeleton className="h-4 w-[60px] max-md:hidden md:ml-6" />
          <Skeleton className="h-4 w-[80px] max-md:ml-auto md:ml-6" />
        </div>
      ))}
    </section>
  </div>
);
