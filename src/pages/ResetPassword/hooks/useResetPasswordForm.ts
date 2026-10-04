import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ERRORS } from '~/constants';
import { ResetPasswordDocument } from '~/graphql/generated';
import { useStartSession } from '~/hooks/useStartSession';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { newPasswordSchema } from '~/lib/validation';

const schema = z.object({
  password: newPasswordSchema({
    required: 'Enter a new password',
    tooShort: 'Use at least 8 characters including a number',
    noNumber: 'Use at least 8 characters including a number'
  })
});

type ResetPasswordValues = z.infer<typeof schema>;

export type ResetOutcome = 'updated' | 'expired';

/* Sets the new password and signs the person in. The link can expire while they're typing. */
export const useResetPasswordForm = (token: string) => {
  const [resetPassword] = useMutation(ResetPasswordDocument);
  const startSession = useStartSession();
  const [outcome, setOutcome] = useState<ResetOutcome | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' }
  });
  const { setError } = form;

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      const { data } = await resetPassword({ variables: { token, password } });
      if (!data) return;
      startSession(data.resetPassword);
      setOutcome('updated');
    } catch (error) {
      switch (getErrorCode(error)) {
        case ERRORS.PASSWORD_RESET_TOKEN_INVALID:
          setOutcome('expired');
          break;
        case ERRORS.INVALID_PASSWORD:
        case ERRORS.TOO_MANY_REQUESTS:
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
    outcome
  };
};
