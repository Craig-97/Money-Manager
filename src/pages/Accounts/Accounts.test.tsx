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
    const dialog = await screen.findByRole('dialog', { name: 'Add account' });
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
          kind: 'SAVINGS',
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

  it('shows what counts, flags an old balance on its row, and opens it to update', async () => {
    const { user } = renderAccounts();

    const counted = await screen.findByRole('region', { name: 'Counted in free to spend' });
    expect(counted).toHaveTextContent('£1,000.00');
    const isa = screen.getByRole('button', { name: 'Edit Cash ISA' });
    expect(isa).toHaveTextContent('Savings · 4.5%');
    expect(isa).toHaveTextContent('Updated 5 weeks ago');
    expect(isa).toHaveTextContent('Kept out');
    await user.click(isa);

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

describe('several accounts to spend from', () => {
  const spending = (fields: Partial<FakeAccount> & { id: string; name: string }): FakeAccount => ({
    ...savings(fields),
    kind: 'SPENDING',
    counts: true,
    ...fields
  });

  // Joint bills alongside the current account, with energy going out of it and the mortgage not
  // saying which account it uses. A holiday account would go below £0 before payday.
  const several = (): FakeBudget => ({
    ...budget(),
    accounts: [
      spending({
        id: 'joint',
        name: 'Joint bills',
        balance: 2105,
        purpose: 'Shared household bills'
      }),
      spending({ id: 'holiday', name: 'Holiday spending', balance: 180 }),
      ...budget().accounts!
    ],
    recurringPayments: [
      ...DEFAULT_BUDGET.recurringPayments,
      {
        id: 'energy',
        name: 'Energy',
        amount: 120,
        category: 'UTILITIES',
        frequency: 'MONTHLY',
        type: 'EXPENSE',
        firstPaymentDate: apiDate('2026-01-09'),
        lastPaymentDate: null,
        nextDueDate: null,
        thisCycle: [],
        renewalDate: null,
        account: 'joint'
      }
    ],
    oneOffPayments: [
      {
        id: 'hotel',
        name: 'Hotel deposit',
        amount: 220,
        dueDate: apiDate('2026-10-23'),
        type: 'EXPENSE',
        category: 'TRAVEL',
        account: 'holiday'
      }
    ]
  });

  it('tags where you get paid, and asks about payments that don’t say', async () => {
    const { user } = renderAccounts(several());

    const spendingGroup = await screen.findByRole('region', { name: 'Spending' });
    expect(within(spendingGroup).getByText('Where you get paid')).toBeInTheDocument();
    expect(
      within(spendingGroup).getByText('Spending · Shared household bills')
    ).toBeInTheDocument();
    // The mortgage doesn't say which account it comes out of
    const banner = screen.getByRole('region', { name: 'Payments without an account' });
    expect(banner).toHaveTextContent('1 payment doesn’t say which account it comes from');
    expect(banner).toHaveTextContent(
      'Mortgage comes out of Current account, where you get paid, until you choose.'
    );

    await user.click(within(banner).getByRole('button', { name: 'Choose accounts' }));
    expect(await screen.findByRole('dialog', { name: 'Set up your accounts' })).toBeInTheDocument();
  });

  it('shows what each account has left by payday, opening one that would go below £0', async () => {
    const { user } = renderAccounts(several());

    await user.click(await screen.findByRole('radio', { name: 'Before payday' }));

    // £1,000 + £2,105 + £180, less the mortgage, energy and the hotel deposit
    expect(screen.getByRole('article', { name: 'Left at payday' })).toHaveTextContent('£2,195.00');
    const holiday = screen.getByRole('button', { name: /Holiday spending/ });
    expect(holiday).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('region', { name: 'Holiday spending before payday' })
    ).toHaveTextContent('Goes below £0 on Fri 23 Oct (−£40.00). Move money in before then.');
    const joint = screen.getByRole('button', { name: /Joint bills/ });
    expect(joint).toHaveAttribute('aria-expanded', 'false');
    await user.click(joint);
    expect(screen.getByRole('region', { name: 'Joint bills before payday' })).toHaveTextContent(
      'Energy'
    );
  });

  it('keeps a spending account out of free to spend, but not where you get paid', async () => {
    const { user, api } = renderAccounts(several());

    const spendingGroup = await screen.findByRole('region', { name: 'Spending' });
    expect(within(spendingGroup).getByText('Always counts')).toBeInTheDocument();
    expect(
      within(spendingGroup).queryByRole('switch', {
        name: 'Count Current account in free to spend'
      })
    ).not.toBeInTheDocument();
    await user.click(
      within(spendingGroup).getByRole('switch', { name: 'Count Holiday spending in free to spend' })
    );

    expect(
      await screen.findByText('Holiday spending is kept out of free to spend')
    ).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([{ id: 'holiday', input: { counts: false } }]);
    // £1,000 + £2,105
    expect(screen.getByRole('region', { name: 'Counted in free to spend' })).toHaveTextContent(
      '£3,105.00'
    );
  });

  it('moves where you get paid from an account’s menu', async () => {
    const { user, api } = renderAccounts(several());

    await user.click(await screen.findByRole('button', { name: 'More actions for Joint bills' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Make where you get paid' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Joint bills' });
    expect(dialog).toHaveTextContent(
      /Your pay goes into Joint bills from \w{3} \d{1,2} \w{3}\. Current account stops being where you get paid\./
    );
    // Where pay lands always counts, so there's no count switch while it moves
    expect(within(dialog).getAllByRole('switch')).toHaveLength(1);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Joint bills saved')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([
      {
        id: 'joint',
        input: expect.objectContaining({ paidInto: true, counts: true })
      }
    ]);
  });

  it('says which account each payment comes out of, moving several at once', async () => {
    const { user, api } = renderAccounts(several());

    await user.click(await screen.findByRole('button', { name: 'Choose accounts' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up your accounts' });
    expect(within(dialog).getByRole('radio', { name: /Current account/ })).toBeChecked();
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select Mortgage' }));
    expect(dialog).toHaveTextContent(
      '1 from Current account · 1 from Joint bills · 0 from Holiday spending'
    );
    // Three accounts to spend from, so the bar picks where they go: the first one they're not on
    expect(
      within(dialog).getByRole('combobox', { name: 'Account to move them to' })
    ).toHaveTextContent('Joint bills');
    await user.click(within(dialog).getByRole('button', { name: 'Move 1' }));
    expect(dialog).toHaveTextContent('0 from Current account · 2 from Joint bills');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Accounts set up')).toBeInTheDocument();
    expect(api.callsTo('AssignPaymentAccounts')).toEqual([
      {
        input: {
          budgetId: 'budget-1',
          payments: [
            { recurringPaymentId: 'recurring-1', accountId: 'joint' },
            { recurringPaymentId: 'energy', accountId: 'joint' }
          ]
        }
      }
    ]);
    // Nothing left unchosen
    expect(screen.queryByRole('button', { name: 'Choose accounts' })).not.toBeInTheDocument();
  });

  it('asks to set up accounts once a second one to spend from is added', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Add account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add account' });
    await user.type(within(dialog).getByLabelText('Balance now'), '2105');
    await user.type(within(dialog).getByLabelText('Name'), 'Joint bills');
    await user.click(within(dialog).getByRole('radio', { name: 'Spending' }));
    // Spending accounts count unless switched out, and have no rate
    expect(within(dialog).getByRole('switch', { name: 'Count in free to spend' })).toBeChecked();
    expect(within(dialog).queryByLabelText('Interest rate (optional)')).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Add account' }));

    expect(await screen.findByRole('dialog', { name: 'Set up your accounts' })).toBeInTheDocument();
    expect(api.callsTo('CreateAccount')).toEqual([
      {
        input: {
          budgetId: 'budget-1',
          kind: 'SPENDING',
          name: 'Joint bills',
          balance: 2105,
          counts: true,
          purpose: null
        }
      }
    ]);
  });
});
