import { screen } from '@testing-library/react';

/* The page's h1 with this name, once it's shown */
export const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });
