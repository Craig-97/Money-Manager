import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import {
  apiDate,
  CURRENT_ACCOUNT_ID,
  createFakeApi,
  DEFAULT_BUDGET,
  FakeAccount,
  FakeBudget
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => vi.useRealTimers());

const savings = (fields: Partial<FakeAccount> & { id: string; name: string }): FakeAccount => ({
  kind: 'SAVINGS',
  balance: 1000,
  counts: false,
  interestRate: null,
  purpose: null,
  balanceUpdatedAt: apiDate('2026-09-30'),
  ...fields
});

// The current account's £1,000, a Cash ISA last updated five weeks ago, and a bills pot
const budget = (): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  currentAccount: { balanceUpdatedAt: apiDate('2026-10-02') },
  accounts: [
    savings({
      id: 'isa',
      name: 'Cash ISA',
      balance: 8650,
      interestRate: 4.5,
      balanceUpdatedAt: apiDate('2026-08-28')
    }),
    savings({ id: 'pot', name: 'Bills pot', balance: 1240, purpose: 'For yearly bills' })
  ]
});

const renderAccounts = (data = budget()) =>
  renderApp({ route: '/accounts', api: createFakeApi({ budget: data }) });

describe('accounts', () => {
  it('shows everything you have, what counts in free to spend, and each account', async () => {
    renderAccounts();

    const hero = await screen.findByRole('article', { name: 'Everything you have' });
    // £1,000 + £8,650 + £1,240
    expect(hero).toHaveTextContent('£10,890.00');
    const counted = screen.getByRole('region', { name: 'Counted in free to spend' });
    expect(counted).toHaveTextContent('1 account');
    expect(counted).toHaveTextContent('£1,000.00');

    const savingsGroup = screen.getByRole('region', { name: 'Savings' });
    expect(within(savingsGroup).getByText('Savings · 4.5%')).toBeInTheDocument();
    expect(within(savingsGroup).getByText('Savings · For yearly bills')).toBeInTheDocument();
    expect(within(savingsGroup).getAllByText('Updated 5 weeks ago')).not.toHaveLength(0);
    const spending = screen.getByRole('region', { name: 'Spending' });
    expect(within(spending).getByText('Always counts')).toBeInTheDocument();
    expect(within(spending).queryByRole('switch')).not.toBeInTheDocument();
  });

  it('counts savings in free to spend with its switch', async () => {
    const { user, api } = renderAccounts();

    await user.click(
      await screen.findByRole('switch', { name: 'Count Cash ISA in free to spend' })
    );

    expect(await screen.findByText('Cash ISA now counts in free to spend')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([{ id: 'isa', input: { counts: true } }]);
    expect(screen.getByRole('region', { name: 'Counted in free to spend' })).toHaveTextContent(
      '£9,650.00'
    );
  });

  it('edits an account in a dialog, its balance first', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Edit Cash ISA' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Cash ISA' });
    const balance = within(dialog).getByLabelText('Balance now');
    expect(balance).toHaveFocus();
    expect(dialog).toHaveTextContent('Updated 5 weeks ago');

    await user.clear(balance);
    await user.type(balance, '8,900');
    await user.type(within(dialog).getByLabelText('What it’s for (optional)'), 'Rainy day');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Cash ISA saved')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([
      {
        id: 'isa',
        input: {
          name: 'Cash ISA',
          balance: 8900,
          counts: false,
          interestRate: 4.5,
          purpose: 'Rainy day'
        }
      }
    ]);
  });

  it('only edits the current account’s name and balance, and never deletes it', async () => {
    const { user } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Edit Current account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Current account' });
    expect(within(dialog).queryByLabelText('Interest rate (optional)')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('switch')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('adds a savings account, kept out of free to spend', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Add account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add savings account' });
    // Asks for what's missing rather than sending it
    await user.click(within(dialog).getByRole('button', { name: 'Add account' }));
    expect(within(dialog).getByText('Give it a name')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Balance now'), '4200');
    await user.type(within(dialog).getByLabelText('Name'), 'Easy access');
    await user.type(within(dialog).getByLabelText('Interest rate (optional)'), '4.1');
    await user.click(within(dialog).getByRole('button', { name: 'Add account' }));

    expect(await screen.findByText('Easy access added')).toBeInTheDocument();
    expect(api.callsTo('CreateAccount')).toEqual([
      {
        input: {
          budgetId: 'budget-1',
          name: 'Easy access',
          balance: 4200,
          counts: false,
          interestRate: 4.1,
          purpose: null
        }
      }
    ]);
    expect(await screen.findByRole('button', { name: 'Edit Easy access' })).toBeInTheDocument();
  });

  it('asks before deleting a savings account', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Bills pot' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete Bills pot?' });
    expect(dialog).toHaveTextContent('Its £1,240.00 comes off everything you have.');

    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(await screen.findByText('Bills pot deleted')).toBeInTheDocument();
    expect(api.callsTo('DeleteAccount')).toEqual([{ id: 'pot' }]);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit Bills pot' })).not.toBeInTheDocument()
    );
  });

  it('suggests adding savings when there are none, and leaves out Owed without debts', async () => {
    renderAccounts({ ...structuredClone(DEFAULT_BUDGET), recurringPayments: [] });

    const savingsGroup = await screen.findByRole('region', { name: 'Savings' });
    expect(savingsGroup).toHaveTextContent('No savings yet.');
    expect(screen.queryByRole('region', { name: 'Owed' })).not.toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Everything you have' })).not.toHaveTextContent(
      'After what you owe'
    );
  });
});

describe('accounts on mobile', () => {
  beforeEach(() => setViewportWidth(390));
  afterEach(() => setViewportWidth(1440));

  it('flags an old balance, and opens it to update', async () => {
    const { user } = renderAccounts();

    await user.click(
      await screen.findByRole('button', { name: /Cash ISA hasn’t been updated in 5 weeks/ })
    );

    const sheet = await screen.findByRole('dialog', { name: 'Edit Cash ISA' });
    expect(within(sheet).getByLabelText('Balance now')).toHaveValue('8,650.00');
  });

  it('shows what each savings account is for under its name', async () => {
    renderAccounts();

    const row = await screen.findByRole('button', { name: 'Edit Bills pot' });
    expect(row).toHaveTextContent('For yearly bills');
    expect(screen.getByRole('button', { name: `Edit Current account` })).toBeInTheDocument();
    expect(CURRENT_ACCOUNT_ID).toBe('account-current');
  });
});
