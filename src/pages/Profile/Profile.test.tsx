import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { usePrefsStore } from '~/state/prefs';
import { createFakeApi, DEFAULT_ACCOUNT, DEFAULT_PASSWORD } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const renderProfile = () => {
  const api = createFakeApi({ account: structuredClone(DEFAULT_ACCOUNT) });
  return { ...renderApp({ route: '/profile', api }), api };
};

const section = (name: string) => screen.findByRole('region', { name });

describe('profile', () => {
  it('saves personal details', async () => {
    const { user, api } = renderProfile();
    const details = await section('Personal details');

    const save = within(details).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    const first = within(details).getByLabelText('First name');
    await user.clear(first);
    await user.type(first, 'Sam');
    await user.click(save);

    expect(await screen.findByText('Personal details saved')).toBeInTheDocument();
    expect(api.callsTo('UpdateCurrentUser')).toEqual([
      { input: { firstName: 'Sam', surname: 'Account', email: 'test@example.com' } }
    ]);
  });

  it('checks the current password before changing it', async () => {
    const { user, api } = renderProfile();
    const password = await section('Password');
    const update = within(password).getByRole('button', { name: 'Save changes' });
    expect(update).toBeDisabled();

    await user.type(within(password).getByLabelText('Current password'), 'wrong-one1');
    await user.type(within(password).getByLabelText('New password'), 'better-pass2');
    await user.type(within(password).getByLabelText('Confirm new password'), 'better-pass3');
    await user.click(update);
    expect(within(password).getByText('The passwords don’t match')).toBeInTheDocument();

    const confirm = within(password).getByLabelText('Confirm new password');
    await user.clear(confirm);
    await user.type(confirm, 'better-pass2');
    await user.click(update);
    expect(
      await within(password).findByText('That isn’t your current password.')
    ).toBeInTheDocument();

    const current = within(password).getByLabelText('Current password');
    await user.clear(current);
    await user.type(current, DEFAULT_PASSWORD);
    await user.click(update);

    expect(await screen.findByText('Password updated')).toBeInTheDocument();
    expect(api.callsTo('ChangePassword').at(-1)).toEqual({
      currentPassword: DEFAULT_PASSWORD,
      newPassword: 'better-pass2'
    });
  });

  it('saves a new payday rule', async () => {
    const { user, api } = renderProfile();
    const payday = await section('Payday');

    const save = within(payday).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    await user.click(within(payday).getByRole('radio', { name: /Set day/ }));
    const day = within(payday).getByLabelText('Day of month');
    await user.click(save);
    expect(within(payday).getByText('Choose a day between 1 and 31')).toBeInTheDocument();

    await user.type(day, '15');
    await user.click(save);

    expect(await screen.findByText('Payday settings saved')).toBeInTheDocument();
    expect(api.callsTo('EditPayday')).toEqual([
      {
        id: 'payday-1',
        payday: expect.objectContaining({ frequency: 'MONTHLY', type: 'SET_DAY', dayOfMonth: 15 })
      }
    ]);
  });

  it('saves pay on the last Thursday of the month', async () => {
    const { user, api } = renderProfile();
    const payday = await section('Payday');

    await user.click(within(payday).getByRole('radio', { name: /Last weekday/ }));
    await user.click(within(payday).getByRole('button', { name: 'Thursday' }));
    await user.click(within(payday).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Payday settings saved')).toBeInTheDocument();
    expect(api.callsTo('EditPayday')).toEqual([
      {
        id: 'payday-1',
        payday: expect.objectContaining({ type: 'LAST_WEEKDAY', weekday: 'THURSDAY' })
      }
    ]);
  });

  it('moves a single payday and puts it back', async () => {
    const { user, api } = renderProfile();
    const payday = await section('Payday');

    // The second payday is always ahead of today, so the day before is always allowed
    await user.click(within(payday).getByRole('button', { name: /^Then,/ }));
    const editor = within(payday).getByRole('group', { name: /^Change / });
    await user.click(within(editor).getByRole('button', { name: 'Save date' }));

    expect(await screen.findByText(/^Payday moved to /)).toBeInTheDocument();
    const [call] = api.callsTo('SetPaydayOverride');
    expect(call).toMatchObject({
      id: 'payday-1',
      for: expect.any(String),
      date: expect.any(String)
    });
    expect(call.date).not.toBe(call.for);
    const moved = await within(payday).findByRole('button', { name: /^Then,.*moved by you/ });

    await user.click(moved);
    await user.click(within(payday).getByRole('button', { name: 'Reset to usual' }));
    expect(await screen.findByText(/^Payday back to /)).toBeInTheDocument();
    expect(api.callsTo('SetPaydayOverride')[1]).toEqual({
      id: 'payday-1',
      for: call.for,
      date: null
    });
  });

  it('holds off moving a payday while the form has unsaved changes', async () => {
    const { user } = renderProfile();
    const payday = await section('Payday');

    await user.click(within(payday).getByRole('radio', { name: /Set day/ }));
    await user.type(within(payday).getByLabelText('Day of month'), '15');

    expect(within(payday).getByRole('button', { name: /^Then,/ })).toBeDisabled();
    expect(
      within(payday).getByText('Save your changes to adjust a single payday')
    ).toBeInTheDocument();
  });

  it('shows what a new balance means before saving it', async () => {
    const { user, api } = renderProfile();
    const balances = await section('Balances');
    const free = () => within(balances).getByText('Free to spend').nextElementSibling;
    const before = free()?.textContent;

    const save = within(balances).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    const bank = within(balances).getByLabelText('Bank balance');
    await user.clear(bank);
    await user.type(bank, '2000');
    expect(free()?.textContent).not.toBe(before);

    await user.click(save);

    expect(await screen.findByText('Balances saved')).toBeInTheDocument();
    expect(api.callsTo('EditAccount')).toEqual([
      {
        id: 'account-1',
        account: { bankBalance: 2000, monthlyIncome: DEFAULT_ACCOUNT.monthlyIncome }
      }
    ]);
  });

  it('follows the device theme when System is picked', async () => {
    const { user } = renderProfile();
    const appearance = await section('Appearance');

    await user.click(within(appearance).getByRole('button', { name: 'System' }));
    expect(usePrefsStore.getState().theme).toBe('system');

    await user.click(within(appearance).getByRole('button', { name: 'Teal' }));
    expect(usePrefsStore.getState().accent).toBe('#0F9F8F');
  });

  it('deletes the account after confirming, and signs out', async () => {
    const { user, api } = renderProfile();
    const account = await section('Account');

    await user.click(within(account).getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete everything' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome back' })
    ).toBeInTheDocument();
    expect(api.callsTo('DeleteCurrentUser')).toHaveLength(1);
  });
});
