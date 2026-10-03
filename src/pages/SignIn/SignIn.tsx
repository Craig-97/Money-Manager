import { CircleAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrandMark } from '~/components/ui/BrandMark';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/ui/Spinner';
import { cn } from '~/lib/cn';
import { getErrorMessage } from '~/lib/errors';
import { useAuthStore } from '~/state/auth';
import { SignInField } from './components';
import { SignInValues, useSignIn } from './hooks';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password')
});

// TODO(phase 3): replaced by the designed sign in screen. This one only gets you into the app.
export const SignIn = () => {
  const signIn = useSignIn();
  const sessionExpired = useAuthStore(state => state.endReason === 'expired');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (values: SignInValues) => {
    try {
      await signIn(values);
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Sign in failed. Please try again.') });
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-7">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-base font-extrabold tracking-[-0.02em]">Money Manager</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-0.045em]">
            Welcome back
          </h1>
          <p className="text-[15px] leading-normal font-medium text-muted">
            Sign in to pick up where you left off.
          </p>
        </div>

        {sessionExpired ? (
          <p
            role="status"
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium">
            Your session has expired. Sign in again to carry on.
          </p>
        ) : null}

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
          <SignInField
            id="email"
            label="Email address"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <SignInField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password')}
          />

          {errors.root ? (
            <p
              role="alert"
              className="flex items-start gap-2 text-[13px] leading-[1.4] font-semibold text-expense">
              <CircleAlert size={16} className="mt-px shrink-0" aria-hidden="true" />
              {errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="accent"
            size="xl"
            disabled={isSubmitting}
            className="mt-1.5 w-full">
            {/* Both labels share one grid cell so the button keeps its size; only one is shown */}
            <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
              <span aria-hidden={isSubmitting} className={cn(isSubmitting && 'invisible')}>
                Sign in
              </span>
              <span
                aria-hidden={!isSubmitting}
                className={cn('flex items-center gap-2.5', !isSubmitting && 'invisible')}>
                <Spinner />
                Signing in…
              </span>
            </span>
          </Button>
        </form>
      </div>
    </main>
  );
};
