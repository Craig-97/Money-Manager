import { FieldError } from '~/components/form/FieldError';
import { CheckIcon, ResendIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';

interface ResendCardProps {
  cooldownSeconds: number;
  resending: boolean;
  resent: boolean;
  error: string | null;
  onResend: () => void;
}

const formatCooldown = (seconds: number) => `0:${String(seconds).padStart(2, '0')}`;

/* "Didn't get it?" with a resend button that counts down before it can be used again */
export const ResendCard = ({
  cooldownSeconds,
  resending,
  resent,
  error,
  onResend
}: ResendCardProps) => {
  const coolingDown = cooldownSeconds > 0;

  return (
    <div className="mt-2 flex w-full flex-col gap-3 rounded-[22px] border border-border bg-surface px-[18px] py-4 md:mt-2.5 md:gap-3.5 md:px-5 md:py-[18px]">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <p className="text-sm leading-[1.45] font-semibold text-muted">
          Didn't get it? Check your spam folder, or
          <span className="md:hidden"> ask for another link.</span>
        </p>
        <Button
          size="md"
          onClick={onResend}
          disabled={coolingDown}
          loading={resending}
          aria-live="polite"
          className="h-12 font-bold disabled:bg-surface-2 disabled:text-muted disabled:opacity-100 md:h-11">
          {coolingDown ? (
            <>
              Resend in <span className="num">{formatCooldown(cooldownSeconds)}</span>
            </>
          ) : (
            <>
              <ResendIcon size={16} />
              Resend link
            </>
          )}
        </Button>
      </div>
      {resent ? (
        <p className="flex items-start gap-2 text-[13px] leading-[1.4] font-bold text-income">
          <CheckIcon size={16} className="shrink-0" />
          New link sent. The previous one no longer works.
        </p>
      ) : null}
      {error ? (
        <FieldError id="resend-error" size="md" alert className="mt-0">
          {error}
        </FieldError>
      ) : null}
    </div>
  );
};
