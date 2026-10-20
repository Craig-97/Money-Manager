import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { createFakeApi, DEFAULT_BUDGET } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

const renderSetup = () => renderApp({ route: '/setup', api: createFakeApi({ budget: null }) });

type User = ReturnType<typeof renderApp>['user'];

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

    expect(await findPageHeading('Where do you keep your money?')).toBeInTheDocument();
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

  it('adds a regular payment from a suggestion with the payment form', async () => {
    const { user } = renderSetup();

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.type(await screen.findByLabelText('Balance now'), '1000');
    await cont(user);
    await user.click(await screen.findByRole('button', { name: 'Netflix' }));

    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    expect(within(dialog).getByLabelText('Name')).toHaveValue('Netflix');
    // Asks for what's missing rather than adding it
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));
    expect(within(dialog).getByText('Enter an amount above £0')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Amount'), '20');
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    const row = await screen.findByRole('button', { name: 'Edit Netflix' });
    expect(row).toHaveTextContent('Monthly');
    expect(screen.getByRole('button', { name: 'Netflix' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('adds other accounts, and payments that move money into them', async () => {
    const api = createFakeApi({ budget: null });
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.clear(await screen.findByLabelText('Account name'));
    await user.type(screen.getByLabelText('Account name'), 'Everyday');
    await user.type(screen.getByLabelText('Balance now'), '7895');
    await user.click(screen.getByRole('button', { name: 'Add an account' }));
    const accountDialog = await screen.findByRole('dialog', { name: 'Add account' });
    await user.type(within(accountDialog).getByLabelText('Balance now'), '8650');
    await user.type(within(accountDialog).getByLabelText('Name'), 'Cash ISA');
    await user.type(within(accountDialog).getByLabelText('Interest rate (optional)'), '4.5');
    await user.click(within(accountDialog).getByRole('button', { name: 'Add account' }));
    expect(await screen.findByRole('button', { name: 'Edit Cash ISA' })).toHaveTextContent(
      'Savings · 4.5%'
    );
    await cont(user);

    await user.click(await screen.findByRole('button', { name: 'Add custom payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Name'), 'ISA top-up');
    await user.type(within(dialog).getByLabelText('Amount'), '250');
    await user.click(within(dialog).getByRole('switch', { name: 'Pays into savings' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));
    expect(await screen.findByRole('button', { name: 'Edit ISA top-up' })).toHaveTextContent(
      'Into Cash ISA'
    );
    await cont(user);
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    await user.click(await screen.findByRole('button', { name: 'Finish setup' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set, Test" })
    ).toBeInTheDocument();
    const [{ input }] = api.callsTo('CreateBudget') as [{ input: Record<string, unknown> }];
    expect(input).toMatchObject({
      bankBalance: 7895,
      paidIntoName: 'Everyday',
      accounts: [
        {
          key: expect.any(String),
          kind: 'SAVINGS',
          name: 'Cash ISA',
          balance: 8650,
          counts: false,
          interestRate: 4.5
        }
      ],
      recurringPayments: [expect.objectContaining({ name: 'ISA top-up', amount: 250 })]
    });
    const [account] = input.accounts as { key: string }[];
    expect((input.recurringPayments as { paysInto: string }[])[0].paysInto).toBe(account.key);
  });

  it('saves the budget and opens the dashboard', async () => {
    const api = createFakeApi({ budget: null });
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3,600');
    await cont(user);
    await user.type(await screen.findByLabelText('Balance now'), '9165');
    await cont(user);

    await user.click(await screen.findByRole('button', { name: 'Netflix' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Amount'), '20');
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));
    await screen.findByRole('button', { name: 'Edit Netflix' });
    await cont(user);

    // Coming up is optional
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    expect(await findPageHeading('Check and finish')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Finish setup' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set, Test" })
    ).toBeInTheDocument();
    const [{ input }] = api.callsTo('CreateBudget') as [{ input: Record<string, unknown> }];
    expect(input).toMatchObject({
      bankBalance: 9165,
      paidIntoName: 'Current account',
      accounts: [],
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
    // It opens with the budget setup saved, rather than loading it again
    expect(api.callsTo('Budget')).toHaveLength(0);
  });

  it('opens the dashboard when setup was finished on another device', async () => {
    const api = createFakeApi({ budget: null });
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.type(await screen.findByLabelText('Balance now'), '500');
    await cont(user);
    await cont(user);
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    // Finished elsewhere while this page was open
    api.db.budget = structuredClone(DEFAULT_BUDGET);
    await user.click(await screen.findByRole('button', { name: 'Finish setup' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('keeps the answers when saving fails', async () => {
    const api = createFakeApi({ budget: null });
    api.failNext('CreateBudget', { code: 'INTERNAL_SERVER_ERROR' });
    const { user } = renderApp({ route: '/setup', api });

    await user.type(await screen.findByLabelText('Take-home pay per month'), '3600');
    await cont(user);
    await user.type(await screen.findByLabelText('Balance now'), '500');
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
