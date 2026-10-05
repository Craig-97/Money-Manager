import { useWatch } from 'react-hook-form';
import { authInputBoxClasses } from '~/components/auth/authClasses';
import { AuthField, authErrorId } from '~/components/auth/AuthField';
import { AuthHeading } from '~/components/auth/AuthHeading';
import { AuthLayout } from '~/components/auth/AuthLayout';
import { AuthResult } from '~/components/auth/AuthResult';
import { PasswordRules } from '~/components/auth/PasswordRules';
import { FieldError } from '~/components/form/FieldError';
import { PasswordInput } from '~/components/form/PasswordInput';
import {
  ArrowRightIcon,
  BrokenLinkIcon,
  CheckIcon,
  KeyIcon,
  ShieldCheckIcon
} from '~/components/icons';
import { Button, buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { Spinner } from '~/components/ui/Spinner';
import { ROUTES } from '~/constants';
import { ResetPasswordPanel } from './components';
import { useResetPasswordForm, useResetToken } from './hooks';

export const ResetPassword = () => {
  const { token, status, email } = useResetToken();
  const { register, control, onSubmit, outcome, errors, isSubmitting } =
    useResetPasswordForm(token);
  const password = useWatch({ control, name: 'password' });

  const view = outcome ?? (status === 'invalid' ? 'expired' : status);

  return (
    <AuthLayout
      panel={<ResetPasswordPanel />}
      back={{ page: 'signIn', to: ROUTES.signIn, label: 'Back to sign in' }}>
      {view === 'checking' ? (
        <div role="status" className="flex flex-1 items-center justify-center py-16 text-muted">
          <Spinner className="size-6" />
          <span className="sr-only">Checking your link</span>
        </div>
      ) : null}

      {view === 'valid' ? (
        <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 md:flex-none">
          <AuthHeading title="Choose a new password" icon={KeyIcon} iconOnMobile>
            {email ? (
              <>
                for <span className="font-bold text-text">{email}</span>
              </>
            ) : null}
          </AuthHeading>

          <div className="flex flex-col gap-[18px] md:mt-3 md:gap-5">
            <AuthField id="password" label="New password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                size="lg"
                autoComplete="new-password"
                placeholder="Create a new password"
                boxClassName={authInputBoxClasses}
                invalid={!!errors.password}
                aria-describedby={
                  errors.password ? `password-rules ${authErrorId('password')}` : 'password-rules'
                }
                {...register('password')}
              />
              <PasswordRules id="password-rules" password={password} invalid={!!errors.password} />
            </AuthField>

            <p className="flex items-center gap-3 rounded-[20px] border border-border bg-surface px-4 py-3.5 text-[13px] leading-[1.45] font-semibold text-muted md:hidden">
              <ShieldCheckIcon className="shrink-0 text-accent-text" />
              We'll sign you straight in once it's updated.
            </p>

            {errors.root ? (
              <FieldError id="reset-error" size="md" alert className="mt-0">
                {errors.root.message}
              </FieldError>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="accent"
            size="xl"
            loading={isSubmitting}
            loadingText="Updating password…"
            className="mt-auto w-full md:mt-1">
            Update password
          </Button>
        </form>
      ) : null}

      {view === 'updated' ? (
        <AuthResult
          icon={CheckIcon}
          title="Password updated"
          description="You're signed in on this device. Use your new password next time."
          actions={
            <PageLink
              page="dashboard"
              to={ROUTES.dashboard}
              className={buttonVariants({ variant: 'accent', size: 'xl', className: 'w-full' })}>
              Continue to dashboard
              <ArrowRightIcon size={18} className="hidden md:block" />
            </PageLink>
          }
        />
      ) : null}

      {view === 'expired' ? (
        <AuthResult
          icon={BrokenLinkIcon}
          tone="problem"
          title="This link has expired"
          description="Reset links work for 1 hour and only once. Request a new one and we'll email it straight away."
          actions={
            <>
              <PageLink
                page="forgotPassword"
                to={ROUTES.forgotPassword}
                className={buttonVariants({ variant: 'accent', size: 'xl', className: 'w-full' })}>
                Send a new link
              </PageLink>
              <PageLink
                page="signIn"
                to={ROUTES.signIn}
                className={buttonVariants({ size: 'xl', className: 'w-full' })}>
                Back to sign in
              </PageLink>
            </>
          }
        />
      ) : null}
    </AuthLayout>
  );
};
