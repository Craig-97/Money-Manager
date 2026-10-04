import { useWatch } from 'react-hook-form';
import {
  authErrorLinkClasses,
  authInputBoxClasses,
  authTextLinkClasses
} from '~/components/auth/authClasses';
import { AuthField, authErrorId } from '~/components/auth/AuthField';
import { AuthHeading } from '~/components/auth/AuthHeading';
import { AuthLayout } from '~/components/auth/AuthLayout';
import { PasswordRules } from '~/components/auth/PasswordRules';
import { FieldError } from '~/components/form/FieldError';
import { PasswordInput } from '~/components/form/PasswordInput';
import { TextInput } from '~/components/form/TextInput';
import { ArrowRightIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { AccountCreated, RegisterPanel, RegisterProgress } from './components';
import { useRegisterForm } from './hooks';

const describedBy = (...ids: (string | false)[]) => ids.filter(Boolean).join(' ') || undefined;

export const Register = () => {
  const { register, control, onSubmit, created, errors, isSubmitting } = useRegisterForm();
  const password = useWatch({ control, name: 'password' });

  return (
    <AuthLayout
      panel={<RegisterPanel created={!!created} />}
      back={{ page: 'landing', to: ROUTES.home, label: 'Home' }}
      wide
      className="gap-[22px]">
      <RegisterProgress created={!!created} />

      {created ? (
        <AccountCreated session={created} />
      ) : (
        <>
          <AuthHeading title="Create your account">
            Takes a minute. Next we'll set up your payday.
          </AuthHeading>

          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-[18px] md:mt-8 md:flex-none md:gap-5">
            <div className="grid grid-cols-2 gap-3 md:gap-3.5">
              <AuthField id="firstName" label="First name" error={errors.firstName?.message}>
                <TextInput
                  id="firstName"
                  size="lg"
                  autoComplete="given-name"
                  boxClassName={authInputBoxClasses}
                  invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? authErrorId('firstName') : undefined}
                  {...register('firstName')}
                />
              </AuthField>
              <AuthField id="surname" label="Surname" error={errors.surname?.message}>
                <TextInput
                  id="surname"
                  size="lg"
                  autoComplete="family-name"
                  boxClassName={authInputBoxClasses}
                  invalid={!!errors.surname}
                  aria-describedby={errors.surname ? authErrorId('surname') : undefined}
                  {...register('surname')}
                />
              </AuthField>
            </div>

            <AuthField
              id="email"
              label="Email address"
              error={
                errors.email ? (
                  <>
                    {errors.email.message}{' '}
                    {errors.email.type === 'exists' ? (
                      <PageLink page="signIn" to={ROUTES.signIn} className={authErrorLinkClasses}>
                        Sign in instead
                      </PageLink>
                    ) : null}
                  </>
                ) : null
              }>
              <TextInput
                id="email"
                type="email"
                size="lg"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                boxClassName={authInputBoxClasses}
                invalid={!!errors.email}
                aria-describedby={errors.email ? authErrorId('email') : undefined}
                {...register('email')}
              />
            </AuthField>

            <AuthField id="password" label="Password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                size="lg"
                autoComplete="new-password"
                placeholder="Create a password"
                boxClassName={authInputBoxClasses}
                invalid={!!errors.password}
                aria-describedby={describedBy(
                  'password-rules',
                  !!errors.password && authErrorId('password')
                )}
                {...register('password')}
              />
              <PasswordRules id="password-rules" password={password} invalid={!!errors.password} />
            </AuthField>

            {errors.root ? (
              <FieldError id="register-error" size="md" alert className="mt-0">
                {errors.root.message}
              </FieldError>
            ) : null}

            <div className="mt-auto flex flex-col gap-3.5 md:mt-2 md:gap-5">
              <Button
                type="submit"
                variant="accent"
                size="xl"
                loading={isSubmitting}
                loadingText="Creating your account…"
                className="w-full">
                Create account
                <ArrowRightIcon size={18} className="hidden md:block" />
              </Button>
              <p className="text-center text-sm font-semibold text-muted">
                Already have an account?{' '}
                <PageLink page="signIn" to={ROUTES.signIn} className={authTextLinkClasses}>
                  Sign in
                </PageLink>
              </p>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
};
