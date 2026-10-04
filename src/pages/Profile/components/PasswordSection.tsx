import { Eye, EyeOff } from 'lucide-react';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { usePasswordForm } from '../hooks';
import { SECTION_ICONS } from './ProfileNav';
import { helpClasses, SettingsTile } from './SettingsTile';

// Bar colours by strength score, weakest first
const STRENGTH_COLOURS = [
  'bg-expense',
  'bg-expense',
  'bg-note-amber-dot',
  'bg-income',
  'bg-income'
];
const STRENGTH_TEXT = ['', 'text-expense', 'text-note-amber-dot', 'text-income', 'text-income'];

const describedBy = (...ids: (string | false | undefined)[]) =>
  ids.filter(Boolean).join(' ') || undefined;

/* Changing the password, with a strength meter */
export const PasswordSection = () => {
  const { register, errors, isSubmitting, onSubmit, visible, toggleVisible, strength } =
    usePasswordForm();
  const type = visible ? 'text' : 'password';

  return (
    <SettingsTile
      id="password"
      icon={SECTION_ICONS.password}
      title="Password"
      description="Use a password you don’t use anywhere else."
      mobileDescription="Use one you don’t use anywhere else."
      onSubmit={() => void onSubmit()}
      footer={
        <>
          <span className={helpClasses}>
            {errors.root ? (
              <span role="alert" className="font-bold text-expense">
                {errors.root.message}
              </span>
            ) : (
              'You’ll stay signed in on this device.'
            )}
          </span>
          <Button
            type="submit"
            variant="solid"
            loading={isSubmitting}
            loadingText="Updating…"
            className="font-bold">
            Update password
          </Button>
        </>
      }>
      <div>
        <Label htmlFor="password-current">Current password</Label>
        <TextInput
          id="password-current"
          type={type}
          autoComplete="current-password"
          placeholder="Enter current password"
          invalid={!!errors.currentPassword}
          aria-describedby={errors.currentPassword ? 'password-current-error' : undefined}
          boxClassName="pr-0.5"
          suffix={
            <IconButton
              aria-label={visible ? 'Hide passwords' : 'Show passwords'}
              aria-pressed={visible}
              onClick={toggleVisible}>
              {visible ? (
                <EyeOff size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </IconButton>
          }
          {...register('currentPassword')}
        />
        {errors.currentPassword ? (
          <FieldError id="password-current-error" alert>
            {errors.currentPassword.message}
          </FieldError>
        ) : null}
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="password-new">New password</Label>
          <TextInput
            id="password-new"
            type={type}
            autoComplete="new-password"
            placeholder="Create a new password"
            invalid={!!errors.newPassword}
            aria-describedby={describedBy(
              errors.newPassword && 'password-new-error',
              'password-new-help'
            )}
            {...register('newPassword')}
          />
          <div aria-hidden="true" className="mt-2.5 flex gap-1.5">
            {[1, 2, 3, 4].map(bar => (
              <span
                key={bar}
                className={cn(
                  'h-1.5 flex-1 rounded-full bg-track transition-colors',
                  strength.score >= bar && STRENGTH_COLOURS[strength.score]
                )}
              />
            ))}
          </div>
          {errors.newPassword ? (
            <FieldError id="password-new-error">{errors.newPassword.message}</FieldError>
          ) : null}
          <p id="password-new-help" className={cn('mt-2', helpClasses)}>
            At least 8 characters, including a number
            {strength.label ? (
              <span className={cn('font-bold', STRENGTH_TEXT[strength.score])}>
                {' '}
                · {strength.label}
              </span>
            ) : null}
          </p>
        </div>
        <div>
          <Label htmlFor="password-confirm">Confirm new password</Label>
          <TextInput
            id="password-confirm"
            type={type}
            autoComplete="new-password"
            placeholder="Type it again"
            invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'password-confirm-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <FieldError id="password-confirm-error">{errors.confirmPassword.message}</FieldError>
          ) : null}
        </div>
      </div>
    </SettingsTile>
  );
};
