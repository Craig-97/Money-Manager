import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { CurrentUserQuery } from '~/graphql/generated';
import { SECTION_ICONS } from './sectionIcons';
import { helpClasses, SettingsTile } from './SettingsTile';
import { useDetailsForm } from '../../hooks';

type User = NonNullable<CurrentUserQuery['tokenFindUser']>;

const errorId = (field: string) => `details-${field}-error`;

/* First name, surname and the email they sign in with */
export const DetailsSection = ({ user }: { user: User }) => {
  const { register, errors, isSubmitting, isDirty, onSubmit } = useDetailsForm(user);

  return (
    <SettingsTile
      id="personal"
      icon={SECTION_ICONS.personal}
      title="Personal details"
      description="Your name and the email you sign in with."
      mobileDescription="Your name and sign-in email."
      onSubmit={() => void onSubmit()}
      footer={
        <>
          <span className={helpClasses}>
            {errors.root ? (
              <span role="alert" className="font-bold text-expense">
                {errors.root.message}
              </span>
            ) : (
              'Your name shows in the sidebar and on this page.'
            )}
          </span>
          <Button
            type="submit"
            variant="accent"
            disabled={!isDirty}
            loading={isSubmitting}
            loadingText="Saving…"
            className="font-bold">
            Save changes
          </Button>
        </>
      }>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="details-first">First name</Label>
          <TextInput
            id="details-first"
            autoComplete="given-name"
            invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? errorId('first') : undefined}
            {...register('firstName')}
          />
          {errors.firstName ? (
            <FieldError id={errorId('first')}>{errors.firstName.message}</FieldError>
          ) : null}
        </div>
        <div>
          <Label htmlFor="details-surname">Surname</Label>
          <TextInput
            id="details-surname"
            autoComplete="family-name"
            invalid={!!errors.surname}
            aria-describedby={errors.surname ? errorId('surname') : undefined}
            {...register('surname')}
          />
          {errors.surname ? (
            <FieldError id={errorId('surname')}>{errors.surname.message}</FieldError>
          ) : null}
        </div>
      </div>
      <div>
        <Label htmlFor="details-email">Email</Label>
        <TextInput
          id="details-email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          aria-describedby={errors.email ? errorId('email') : 'details-email-help'}
          {...register('email')}
        />
        {errors.email ? (
          <FieldError id={errorId('email')} alert>
            {errors.email.message}
          </FieldError>
        ) : (
          <p id="details-email-help" className={`mt-2 ${helpClasses}`}>
            You’ll sign in with this from now on.
          </p>
        )}
      </div>
    </SettingsTile>
  );
};
