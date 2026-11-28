import { z } from 'zod';

// The API's rules for a new password (validatePassword in the API). Shown as live checks.
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { label: 'Contains a number', test: (password: string) => /[0-9]/.test(password) }
] as const;

/*
 * A new password that meets the API's rules. Only the first failing message is shown; what an
 * empty one says depends on the screen: "Create a password", "Enter a new password".
 */
export const newPasswordSchema = (required: string) =>
  z
    .string()
    .min(1, required)
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain a number');
