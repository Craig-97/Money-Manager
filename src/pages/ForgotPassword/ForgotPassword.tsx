import { AuthAlternative } from '~/components/auth/AuthAlternative';
import { authInputBoxClasses, authTextLinkClasses } from '~/components/auth/authClasses';
import { AuthField, authErrorId } from '~/components/auth/AuthField';
import { AuthHeading } from '~/components/auth/AuthHeading';
import { AuthLayout } from '~/components/auth/AuthLayout';
import { AuthResult } from '~/components/auth/AuthResult';
import { HeroCard } from '~/components/auth/HeroCard';
import { TextInput } from '~/components/form/TextInput';
import { ArrowRightIcon, ClockIcon, LockIcon, MailIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { ForgotPasswordPanel, ResendCard } from './components';
import { useForgotPasswordForm } from './hooks';

export const ForgotPassword = () => {
  const {
    register,
    onSubmit,
    sentTo,
    resend,
    resending,
    resent,
    resendError,
    changeEmail,
    cooldownSeconds,
    errors,
    isSubmitting
  } = useForgotPasswordForm();

  return (
    <AuthLayout
      panel={<ForgotPasswordPanel sent={sentTo !== null} />}
      back={{ page: 'signIn', to: ROUTES.signIn, label: 'Back to sign in' }}
      topBarEnd={
        <>
          New here?{' '}
          <PageLink page="register" to={ROUTES.register} className={authTextLinkClasses}>
            Create an account
          </PageLink>
        </>
      }>
      {sentTo === null ? (
        <>
          <HeroCard className="items-center gap-3.5">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-hero-chip">
              <LockIcon size={24} />
            </span>
            <div>
              <p className="text-[15px] font-extrabold">Locked out? It happens.</p>
              <p className="mt-[3px] text-[13px] font-medium text-hero-muted">
                Email, link, new password. Done.
              </p>
            </div>
          </HeroCard>

          <AuthHeading title="Reset your password" icon={LockIcon}>
            Enter the email you signed up with and we'll send you a link to choose a new one.
          </AuthHeading>

          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-[18px] md:mt-8 md:gap-5">
            <AuthField id="email" label="Email address" error={errors.email?.message}>
              <TextInput
                id="email"
                type="email"
                size="lg"
                autoComplete="username"
                inputMode="email"
                placeholder="you@example.com"
                boxClassName={authInputBoxClasses}
                invalid={!!errors.email}
                aria-describedby={errors.email ? authErrorId('email') : undefined}
                {...register('email')}
              />
            </AuthField>

            <Button
              type="submit"
              variant="accent"
              size="xl"
              loading={isSubmitting}
              loadingText="Sending link…"
              className="mt-1.5 w-full md:mt-1">
              Send reset link
              <ArrowRightIcon size={18} className="hidden md:block" />
            </Button>
          </form>

          <AuthAlternative
            icon={ClockIcon}
            title="Remembered it?"
            description="Your password hasn't changed. Sign in as normal."
            page="signIn"
            to={ROUTES.signIn}
            label="Sign in"
            mobileLabel="Back to sign in"
          />
        </>
      ) : (
        <AuthResult
          icon={MailIcon}
          title="Check your email"
          description={
            <>
              If there's an account for{' '}
              <strong className="font-bold break-all text-text md:break-normal">{sentTo}</strong>,
              we've sent a link to reset your password. It expires in 1 hour.
            </>
          }
          actions={
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-between">
              <Button
                variant="ghost"
                size="xl"
                className="md:-ml-4 md:h-11 md:px-4 md:text-sm"
                onClick={changeEmail}>
                Use a different email
              </Button>
              <PageLink
                page="signIn"
                to={ROUTES.signIn}
                className="-mr-4 hidden h-11 items-center rounded-full px-4 text-sm font-bold text-muted no-underline transition-colors hover:bg-hover hover:text-text md:inline-flex">
                Back to sign in
              </PageLink>
            </div>
          }>
          <ResendCard
            cooldownSeconds={cooldownSeconds}
            resending={resending}
            resent={resent}
            error={resendError}
            onResend={() => void resend()}
          />
        </AuthResult>
      )}
    </AuthLayout>
  );
};
