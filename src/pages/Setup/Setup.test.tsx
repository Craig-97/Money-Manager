import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { createFakeApi, DEFAULT_USER } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

const renderSetup = () => renderApp({ route: '/setup', api: createFakeApi({ account: null }) });

type User = ReturnType<typeof renderApp>['user'];

const pickToday = async (user: User, field: HTMLElement) => {
  await user.click(field);
  await user.click(await screen.findByRole('button', { name: 'Today' }));
};

const cont = (user: User) => user.click(screen.getByRole('button', { name: 'Continue' }));

describe('setup', () => {
  it('asks for take-home pay before moving on', async () => {
    const { user } = renderSetup();

    await findPageHeading('When do you get paid?');
    await cont(user);

    expect(
      screen.getByText('Enter your take-home pay. It must be more than £0.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Take-home pay per month')).toHaveAttribute(
      'aria-invalid',
      'true'
    );

    await user.type(screen.getByLabelText('Take-home pay per month'), '3600');
    await cont(user);

    expect(await findPageHeading("What's in your bank right now?")).toBeInTheDocument();
  });

  it('only offers the payday rules that fit how often you are paid', async () => {
    const { user } = renderSetup();

    await findPageHeading('When do you get paid?');
    const rules = () => within(screen.getByRole('radiogroup')).getAllByRole('radio');
    expect(rules()).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Set day/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Weekly' }));

    expect(rules()).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /Set weekday/ })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Friday' })).toHaveAttribute('aria-pressed', 'true');
    // Weekly pay counts from a first pay date
    expect(screen.getByLabelText('Date of your next pay')).toBeInTheDocument();
  });

  it('checks regular payments have a name, amount and date', async () => {
    const { user } = renderSetup();

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.type(await screen.findByLabelText('Current bank balance'), '1000');
    await cont(user);
    await user.click(await screen.findByRole('button', { name: 'Netflix' }));
    await cont(user);

    expect(screen.getByText('Add an amount more than £0')).toBeInTheDocument();
    expect(screen.getByText('Add the date of the next payment')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Add your regular payments'
    );
  });

  it('saves the account and opens the dashboard', async () => {
    const api = createFakeApi({ account: null });
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3,600');
    await cont(user);
    await user.type(await screen.findByLabelText('Current bank balance'), '9165');
    await cont(user);

    await user.click(await screen.findByRole('button', { name: 'Netflix' }));
    await user.type(screen.getByLabelText('Amount'), '20');
    await pickToday(user, screen.getByLabelText('Next payment'));
    await cont(user);

    // Coming up is optional
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    expect(await findPageHeading('Check and finish')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Finish setup' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set, Test" })
    ).toBeInTheDocument();
    const [{ account }] = api.callsTo('CreateAccount') as [{ account: Record<string, unknown> }];
    expect(account).toMatchObject({
      userId: DEFAULT_USER.id,
      bankBalance: 9165,
      monthlyIncome: 3600,
      payday: { frequency: 'MONTHLY', type: 'LAST_DAY', bankHolidayRegion: 'ENGLAND_AND_WALES' },
      recurringPayments: [
        {
          name: 'Netflix',
          amount: 20,
          frequency: 'MONTHLY',
          category: 'SUBSCRIPTION',
          type: 'EXPENSE'
        }
      ],
      oneOffPayments: []
    });

    await user.click(screen.getByRole('button', { name: 'Go to dashboard' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('keeps the answers when saving fails', async () => {
    const api = createFakeApi({ account: null });
    api.failNext('CreateAccount', 'INTERNAL_SERVER_ERROR');
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.type(await screen.findByLabelText('Current bank balance'), '500');
    await cont(user);
    await cont(user);
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    await user.click(await screen.findByRole('button', { name: 'Finish setup' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't save your setup");

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set, Test" })
    ).toBeInTheDocument();
  });
});
