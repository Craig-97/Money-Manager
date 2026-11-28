import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* Joins class names, letting later Tailwind classes override earlier ones */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
