import { cn } from '~/lib/cn';

/* "Step 1 of 2" above the form, with a two-segment bar */
export const RegisterProgress = ({ created }: { created: boolean }) => (
  <div className="flex items-center gap-3 md:mb-7 md:gap-3.5">
    <div aria-hidden="true" className="flex w-20 gap-1.5 md:w-24">
      <span className="h-1.5 flex-1 rounded-full bg-accent" />
      <span className={cn('h-1.5 flex-1 rounded-full', created ? 'bg-accent' : 'bg-track')} />
    </div>
    <p className="text-[13px] font-bold text-muted">
      {created ? 'Step 2 of 2 · Set up your account' : 'Step 1 of 2 · Account'}
    </p>
  </div>
);
