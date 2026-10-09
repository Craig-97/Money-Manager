import { Check } from 'lucide-react';
import { SidebarUserChip } from '~/components/layout/Sidebar/SidebarUserChip';
import { BrandMark } from '~/components/ui/BrandMark';
import { cn } from '~/lib/cn';
import { SetupState } from '../../../hooks';
import { STEPS } from '../../../setupModel';

interface SetupNavProps {
  setup: SetupState;
  // The line under each step's title, e.g. "Monthly · last working day"
  stepSummaries: string[];
}

const noop = () => undefined;

/* The steps down the side from 860px, each one a button back to it once reached */
export const SetupSidebar = ({ setup, stepSummaries }: SetupNavProps) => {
  const { step, maxStep, finished, saving, goTo } = setup;

  return (
    <aside className="my-4 ml-4 hidden w-[284px] shrink-0 flex-col gap-7 overflow-y-auto rounded-[28px] border border-border bg-surface px-4 py-[22px] min-[53.75rem]:flex">
      <div className="flex items-center gap-2.5 px-1.5">
        <BrandMark />
        <span className="text-base font-bold">Money Manager</span>
      </div>
      <nav aria-label="Setup steps" className="flex flex-col gap-1">
        <p className="px-3 pb-2 text-xs font-bold tracking-[0.04em] text-muted uppercase">
          Set up your account
        </p>
        {STEPS.map((item, index) => {
          const isCurrent = index === step && !finished;
          const isDone = (finished || index < maxStep || index < step) && !isCurrent;
          return (
            <button
              key={item.title}
              type="button"
              disabled={index > maxStep || saving}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => goTo(index)}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3 rounded-[18px] px-3 py-2.5 text-left text-muted transition-colors hover:bg-hover disabled:cursor-default disabled:hover:bg-transparent',
                isCurrent && 'bg-accent-soft text-text hover:bg-accent-soft',
                isDone && 'text-text'
              )}>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong text-xs font-extrabold text-muted',
                  isCurrent && 'border-accent bg-accent text-on-accent',
                  isDone && 'border-transparent bg-income-bg text-income'
                )}>
                {isDone ? <Check size={14} strokeWidth={2.75} aria-hidden="true" /> : index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 pt-[3px]">
                <span className="text-sm font-bold">{item.title}</span>
                <span className="text-xs text-muted">{stepSummaries[index]}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <SidebarUserChip expanded onNavigate={noop} />
      </div>
    </aside>
  );
};
