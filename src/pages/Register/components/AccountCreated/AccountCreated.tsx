import { AuthResult } from '~/components/auth';
import { ArrowRightIcon, CheckIcon } from '~/components/icons';
import { Button } from '~/components/ui';
import { AuthSessionFragment } from '~/graphql/generated';
import { useStartSession } from '~/hooks/useStartSession';

// Setup's steps
const SETUP_STEPS = [
  { label: 'Pay', note: 'When you get paid' },
  { label: 'Your accounts', note: 'Where your money is' },
  { label: 'Regular payments', note: 'Tap to add' },
  { label: 'Coming up', note: 'Optional' },
  { label: 'Review', note: 'Check and finish' }
];

/* Shown once the account exists. Starting setup starts the session, and the guards open setup. */
export const AccountCreated = ({ session }: { session: AuthSessionFragment }) => {
  const startSession = useStartSession();

  return (
    <AuthResult
      icon={CheckIcon}
      title="Account created"
      description={
        <>
          Nice to meet you, {session.user.firstName}. Next, tell us when you get paid, where you
          keep your money and what goes out each month
          <span className="hidden md:inline">, and we'll build your first cycle</span>.
        </>
      }
      actions={
        <Button variant="accent" size="xl" className="w-full" onClick={() => startSession(session)}>
          Set up your account
          <ArrowRightIcon size={18} className="hidden md:block" />
        </Button>
      }>
      <ol className="mt-2 w-full rounded-3xl border border-border bg-surface p-1.5">
        {SETUP_STEPS.map((step, index) => (
          <li
            key={step.label}
            className="flex min-h-12 items-center gap-3 px-3 py-2 text-sm font-bold md:px-3.5">
            <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent-text">
              {index + 1}
            </span>
            {step.label}
            {step.note ? (
              <span className="ml-auto text-xs font-semibold text-muted">{step.note}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </AuthResult>
  );
};
