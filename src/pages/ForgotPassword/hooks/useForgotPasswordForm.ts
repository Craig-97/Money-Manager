import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestPasswordResetDocument } from '~/graphql/generated';
import { useCooldown } from '~/hooks/useCooldown';
import { getApiErrorMessage } from '~/lib/errors';
import { emailSchema } from '~/lib/validation';

// How long before another link can be requested, so the button can't be mashed
const RESEND_COOLDOWN_SECONDS = 30;

const schema = z.object({ email: emailSchema });

type ForgotPasswordValues = z.infer<typeof schema>;

/* Requests a reset link, then lets the person resend it after a short wait */
export const useForgotPasswordForm = () => {
  const [requestReset, { loading: resending }] = useMutation(RequestPasswordResetDocument);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS);
  // The address the link went to; null until it's sent
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await requestReset({ variables: { email } });
      setSentTo(email);
      setResent(false);
      setResendError(null);
      cooldown.start();
    } catch (error) {
      // Mostly TOO_MANY_REQUESTS: the API never says whether the email has an account
      form.setError('email', { message: getApiErrorMessage(error) }, { shouldFocus: true });
    }
  });

  const resend = async () => {
    if (!sentTo || cooldown.coolingDown) return;
    setResendError(null);
    try {
      await requestReset({ variables: { email: sentTo } });
      setResent(true);
      cooldown.start();
    } catch (error) {
      setResent(false);
      setResendError(getApiErrorMessage(error));
    }
  };

  const changeEmail = () => {
    setSentTo(null);
    cooldown.stop();
  };

  // Through useFormState rather than form.formState: React Compiler memoises the form object, so
  // the page wouldn't see formState's proxy update
  const { errors, isSubmitting } = useFormState({ control: form.control });

  return {
    register: form.register,
    control: form.control,
    errors,
    isSubmitting,
    onSubmit,
    sentTo,
    resend,
    resending,
    resent,
    resendError,
    changeEmail,
    cooldownSeconds: cooldown.remaining
  };
};
