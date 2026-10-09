import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ERRORS } from '~/constants';
import { CurrentUserQuery, UpdateCurrentUserDocument } from '~/graphql/generated';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { emailSchema } from '~/lib/validation';
import { showToast } from '~/state/toast';

const schema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name'),
  surname: z.string().trim().min(1, 'Enter your surname'),
  email: emailSchema
});

type DetailsValues = z.infer<typeof schema>;

type User = NonNullable<CurrentUserQuery['tokenFindUser']>;

/* Name and email. The saved user comes back from the API, so the header and sidebar update too. */
export const useDetailsForm = (user: User) => {
  const [updateCurrentUser] = useMutation(UpdateCurrentUserDocument);
  const form = useForm<DetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: user.firstName, surname: user.surname, email: user.email }
  });
  const { setError, reset } = form;

  const onSubmit = form.handleSubmit(async input => {
    try {
      await updateCurrentUser({ variables: { input } });
      reset(input);
      showToast({ message: 'Personal details saved' });
    } catch (error) {
      if (getErrorCode(error) === ERRORS.USER_EXISTS) {
        setError(
          'email',
          { message: 'An account with this email already exists.' },
          { shouldFocus: true }
        );
      } else {
        setError('root', { message: getApiErrorMessage(error) });
      }
    }
  });

  // useFormState rather than form.formState, which React Compiler would memoise
  const { errors, isSubmitting, isDirty } = useFormState({ control: form.control });

  return { register: form.register, errors, isSubmitting, isDirty, onSubmit };
};
