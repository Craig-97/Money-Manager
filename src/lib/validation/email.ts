import { z } from 'zod';

/* A required email address, trimmed */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .pipe(z.email('Enter a valid email address'));
