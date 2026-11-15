import { Plus } from 'lucide-react';
import {
  AuthAlternative,
  authErrorId,
  authErrorLinkClasses,
  AuthField,
  AuthHeading,
  authInputBoxClasses,
  AuthLayout,
  HeroCard
} from '~/components/auth';
import { FieldError, PasswordInput, TextInput } from '~/components/form';
import { ArrowRightIcon } from '~/components/icons';
import { Button, PageLink } from '~/components/ui';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/state/auth';
import { SignInPanel } from './components';
import { useSignInForm } from './hooks';

export const SignIn = () => {
  const { register, onSubmit, errors, isSubmitting } = useSignInForm();
  const sessionExpired = useAuthStore(s => s.endReason === 'expired');

  return (
    <AuthLayout panel={<SignInPanel />} back={{ page: 'landing', to: ROUTES.home, label: 'Home' }}>
      <HeroCard className="items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-hero-muted">Free to spend</p>
          <p className="mt-1 num text-[28px] font-extrabold tracking-[-0.05em]">£9,185.00</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-hero-muted">Next payday</p>
          <p className="mt-1 num text-base font-extrabold">28 days</p>
        </div>
      </HeroCard>

      <AuthHeading title="Welcome back">Sign in to pick up where you left off.</AuthHeading>

      {sessionExpired ? (
        <p
          role="status"
          className="rounded-[20px] border border-border bg-surface px-4 py-3.5 text-sm font-semibold md:mt-7">
          Your session has expired. Sign in again to carry on.
        </p>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px] md:mt-9 md:gap-5">
        <AuthField
          id="email"
          label="Email address"
          error={
            errors.email ? (
              <>
                {errors.email.message}{' '}
                {errors.email.type === 'notFound' ? (
                  <PageLink page="register" to={ROUTES.register} className={authErrorLinkClasses}>
                    Create an account
                  </PageLink>
                ) : null}
              </>
            ) : null
          }>
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

        <AuthField
          id="password"
          label="Password"
          labelEnd={
            <PageLink
              page="forgotPassword"
              to={ROUTES.forgotPassword}
              className="-mr-3 inline-flex h-11 items-center rounded-full px-3 text-[13px] font-bold text-accent-text transition-colors hover:bg-hover hover:text-text md:-mr-4 md:px-4">
              Forgot password?
            </PageLink>
          }
          error={
            errors.password ? (
              <>
                {errors.password.message}{' '}
                {errors.password.type === 'wrong' ? (
                  <PageLink
                    page="forgotPassword"
                    to={ROUTES.forgotPassword}
                    className={authErrorLinkClasses}>
                    Reset your password
                  </PageLink>
                ) : null}
              </>
            ) : null
          }>
          <PasswordInput
            id="password"
            size="lg"
            autoComplete="current-password"
            placeholder="Your password"
            boxClassName={authInputBoxClasses}
            invalid={!!errors.password}
            aria-describedby={errors.password ? authErrorId('password') : undefined}
            {...register('password')}
          />
        </AuthField>

        {errors.root ? (
          <FieldError id="sign-in-error" size="md" alert className="mt-0">
            {errors.root.message}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          variant="accent"
          size="xl"
          loading={isSubmitting}
          loadingText="Signing in…"
          className="mt-1.5 w-full md:mt-2">
          Sign in
          <ArrowRightIcon size={18} className="hidden md:block" />
        </Button>
      </form>

      <AuthAlternative
        icon={Plus}
        title="New to Money Manager?"
        description="Set up your first payday cycle in a few minutes."
        page="register"
        to={ROUTES.register}
        label="Create account"
        mobileLabel="Create an account"
      />
    </AuthLayout>
  );
};
