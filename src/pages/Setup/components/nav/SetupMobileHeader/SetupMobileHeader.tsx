import { BrandMark } from '~/components/ui/BrandMark';
import { useLogout } from '~/hooks/useLogout';
import { cn } from '~/lib/cn';
import { SetupState } from '../../../hooks';
import { STEPS } from '../../../setupModel';

/* Below 860px: the logo, which step this is, sign out, and a bar per step */
export const SetupMobileHeader = ({ setup }: { setup: SetupState }) => {
  const logout = useLogout();
  const { step, finished } = setup;

  return (
    <div className="min-[53.75rem]:hidden">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[15px] font-bold">
            Step {step + 1} of {STEPS.length} · {STEPS[step].title}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer px-1.5 py-3 text-[13px] font-bold text-accent-text hover:text-text">
          Sign out
        </button>
      </div>
      <div aria-hidden="true" className="-mt-2 mb-6 flex gap-1.5">
        {STEPS.map((item, index) => (
          <span
            key={item.title}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index <= step || finished ? 'bg-accent' : 'bg-track'
            )}
          />
        ))}
      </div>
    </div>
  );
};
