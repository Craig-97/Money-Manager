import { screen, waitFor } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const openSetup = async () => {
  const app = renderApp({ route: '/setup', api: createFakeApi({ account: null }) });
  await screen.findByLabelText('Bank Balance');
  return app;
};

describe('Account setup', () => {
  it('starts on the basic info step with next disabled', async () => {
    await openSetup();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables next once the bank balance and monthly income are entered', async () => {
    const { user } = await openSetup();

    await user.type(screen.getByLabelText('Bank Balance'), '500');
    await user.type(screen.getByLabelText('Monthly Income'), '2000');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
  });

  it('walks through every step and creates the account', async () => {
    const { user, api } = await openSetup();

    await user.type(screen.getByLabelText('Bank Balance'), '500');
    await user.type(screen.getByLabelText('Monthly Income'), '2000');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());

    // Basic info -> bills -> payments -> payday
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await user.click(await screen.findByRole('button', { name: 'Complete Setup' }));

    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
    expect(api.callsTo('CreateAccount')).toEqual([
      {
        account: {
          bankBalance: 500,
          monthlyIncome: 2000,
          bills: [],
          oneOffPayments: [],
          payday: { type: 'LAST_DAY', frequency: 'MONTHLY', bankHolidayRegion: 'SCOTLAND' },
          userId: 'user-1'
        }
      }
    ]);
  });
});
