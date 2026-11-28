import { z } from 'zod';

/* A first name and surname, both needed, trimmed */
export const firstNameSchema = z.string().trim().min(1, 'Enter your first name');
export const surnameSchema = z.string().trim().min(1, 'Enter your surname');
