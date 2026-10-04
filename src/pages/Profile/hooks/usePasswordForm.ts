import { useState } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ERRORS } from '~/constants';
import { ChangePasswordDocument } from '~/graphql/generated';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { newPasswordSchema } from '~/lib/validation';
import { showToast } from '~/state/toast';
import { passwordStrength } from '../profileModel';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: newPasswordSchema({
      required: 'Create a new password',
      tooShort: 'Password must be at least 8 characters',
      noNumber: 'Password must contain a number'
    }),
    confirmPassword: z.string().min(1, 'Type your new password again')
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords don’t match'
  });

type PasswordValues = z.infer<typeof schema>;

const EMPTY: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/* Changing the password: the API checks the current one first */
export const usePasswordForm = () => {
  const [changePassword] = useMutation(ChangePasswordDocument);
  // One switch shows or hides all three fields
  const [visible, setVisible] = useState(false);
  const form = useForm<PasswordValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const { setError, reset } = form;
  const newPassword = useWatch({ control: form.control, name: 'newPassword' });

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword: next }) => {
    try {
      await changePassword({ variables: { currentPassword, newPassword: next } });
      reset(EMPTY);
      setVisible(false);
      showToast({ message: 'Password updated' });
    } catch (error) {
      switch (getErrorCode(error)) {
        case ERRORS.INVALID_CREDENTIALS:
          setError(
            'currentPassword',
            { message: 'That isn’t your current password.' },
            { shouldFocus: true }
          );
          break;
        case ERRORS.INVALID_PASSWORD:
          setError('newPassword', { message: getApiErrorMessage(error) }, { shouldFocus: true });
          break;
        default:
          setError('root', { message: getApiErrorMessage(error) });
      }
    }
  });

  const { errors, isSubmitting } = useFormState({ control: form.control });

  return {
    register: form.register,
    errors,
    isSubmitting,
    onSubmit,
    visible,
    toggleVisible: () => setVisible(v => !v),
    strength: passwordStrength(newPassword)
  };
};
