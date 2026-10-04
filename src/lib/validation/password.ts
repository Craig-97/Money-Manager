import { z } from 'zod';

// The API's rules for a new password (validatePassword in the API). Shown as live checks.
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { label: 'Contains a number', test: (password: string) => /[0-9]/.test(password) }
] as const;

interface NewPasswordMessages {
  required: string;
  tooShort: string;
  noNumber: string;
}

/* A new password that meets the API's rules. Only the first failing message is shown. */
export const newPasswordSchema = ({ required, tooShort, noNumber }: NewPasswordMessages) =>
  z.string().min(1, required).min(8, tooShort).regex(/[0-9]/, noNumber);
