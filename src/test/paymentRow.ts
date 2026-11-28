import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

/*
 * Opens a payment from its row, which shows its quick sheet (a dialog on desktop), then the full
 * form from there with Edit payment
 */
export const editFromRow = async (user: UserEvent, name: string) => {
  await user.click(await screen.findByRole('button', { name }));
  const sheet = await screen.findByRole('dialog', { name });
  await user.click(within(sheet).getByRole('button', { name: 'Edit payment' }));
};
