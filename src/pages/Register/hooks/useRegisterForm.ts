import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ERRORS } from '~/constants';
import { AuthSessionFragment, RegisterAndLoginDocument } from '~/graphql/generated';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { emailSchema, firstNameSchema, newPasswordSchema, surnameSchema } from '~/lib/validation';

const schema = z.object({
  firstName: firstNameSchema,
  surname: surnameSchema,
  email: emailSchema,
  password: newPasswordSchema('Create a password')
});

type RegisterValues = z.infer<typeof schema>;

/*
 * The register form. Once the account exists the session is held back, so the "Account created"
 * screen can show before the person moves on to setup.
 */
export const useRegisterForm = () => {
  const [registerAndLogin] = useMutation(RegisterAndLoginDocument);
  const [created, setCreated] = useState<AuthSessionFragment | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', surname: '', email: '', password: '' }
  });
  const { setError } = form;

  const onSubmit = form.handleSubmit(async input => {
    try {
      const { data } = await registerAndLogin({ variables: { input } });
      if (data) setCreated(data.registerAndLogin);
    } catch (error) {
      switch (getErrorCode(error)) {
        case ERRORS.USER_EXISTS:
          setError(
            'email',
            { type: 'exists', message: 'An account with this email already exists.' },
            { shouldFocus: true }
          );
          break;
        case ERRORS.INVALID_PASSWORD:
          setError('password', { message: getApiErrorMessage(error) }, { shouldFocus: true });
          break;
        default:
          setError('root', { message: getApiErrorMessage(error) });
      }
    }
  });

  // Through useFormState rather than form.formState: React Compiler memoises the form object, so
  // the page wouldn't see formState's proxy update
  const { errors, isSubmitting } = useFormState({ control: form.control });

  return {
    register: form.register,
    control: form.control,
    errors,
    isSubmitting,
    onSubmit,
    created
  };
};
