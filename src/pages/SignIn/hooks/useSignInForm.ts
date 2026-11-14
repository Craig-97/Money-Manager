import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ERRORS } from '~/constants';
import { LoginDocument } from '~/graphql/generated';
import { useStartSession } from '~/hooks/useStartSession';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { emailSchema } from '~/lib/validation';

// Only checks a password was typed: accounts made before the current rules may have shorter ones
const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password')
});

type SignInValues = z.infer<typeof schema>;

/* The sign in form. API errors land on the field they're about, with a type for the follow-up link. */
export const useSignInForm = () => {
  const [login] = useMutation(LoginDocument);
  const startSession = useStartSession();
  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });
  const { setError, setValue } = form;

  const onSubmit = form.handleSubmit(async variables => {
    try {
      const { data } = await login({ variables });
      if (data) startSession(data.login);
    } catch (error) {
      switch (getErrorCode(error)) {
        case ERRORS.USER_EMAIL_NOT_FOUND:
          setError(
            'email',
            { type: 'notFound', message: "We couldn't find an account with that email." },
            { shouldFocus: true }
          );
          break;
        case ERRORS.INVALID_CREDENTIALS:
          setValue('password', '');
          setError(
            'password',
            { type: 'wrong', message: "That password isn't right." },
            { shouldFocus: true }
          );
          break;
        case ERRORS.TOO_MANY_REQUESTS:
          setError('password', { type: 'rateLimited', message: getApiErrorMessage(error) });
          break;
        default:
          setError('root', { message: getApiErrorMessage(error) });
      }
    }
  });

  // Through useFormState rather than form.formState: React Compiler memoises the form object, so
  // the page wouldn't see formState's proxy update
  const { errors, isSubmitting } = useFormState({ control: form.control });

  return { register: form.register, errors, isSubmitting, onSubmit };
};
