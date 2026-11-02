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
  interest: null,
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
      interest: { rate: 4.5, frequency: null, day: null, nextDate: null },
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

    // Its name opens its view; Edit account opens the full form
    await user.click(await screen.findByRole('button', { name: 'Cash ISA' }));
    const view = await screen.findByRole('dialog', { name: 'Cash ISA' });
    await user.click(within(view).getByRole('button', { name: 'Edit account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Cash ISA' });
    const balance = within(dialog).getByLabelText('Balance now');
    expect(balance).toHaveFocus();
    expect(dialog).toHaveTextContent('Updated 5 weeks ago');

    await user.clear(balance);
    await user.type(balance, '8,900');
    // What it's for is under More options, which says it's not set yet
    const more = within(dialog).getByRole('button', { name: /More options/ });
    expect(more).toHaveTextContent('What it’s for · savings · kept out of free to spend');
    await user.click(more);
    await user.type(within(dialog).getByLabelText('What it’s for'), 'Rainy day');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Cash ISA saved')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([
      {
        id: 'isa',
        input: {
          name: 'Cash ISA',
          balance: 8900,
          counts: false,
          purpose: 'Rainy day'
        }
      }
    ]);
  });

  it('only edits the current account’s name and balance, and never deletes it', async () => {
    const { user } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Current account' }));
    const view = await screen.findByRole('dialog', { name: 'Current account' });
    await user.click(within(view).getByRole('button', { name: 'Edit account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Current account' });
    expect(within(dialog).queryByLabelText('Rate (AER)')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('switch')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('adds a savings account, kept out of free to spend', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Add account' }));
    // First, what kind of account it is
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Add account' })).getByRole('button', {
        name: /Savings account/
      })
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add savings account' });
    expect(within(dialog).queryByRole('radio', { name: 'Spending' })).not.toBeInTheDocument();
    // Asks for what's missing rather than sending it
    await user.click(within(dialog).getByRole('button', { name: 'Add account' }));
    expect(within(dialog).getByText('Give it a name')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Balance now'), '4200');
    await user.type(within(dialog).getByLabelText('Name'), 'Easy access');
    await user.type(within(dialog).getByLabelText('Rate (AER)'), '4.1');
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
          interest: { rate: 4.1, frequency: null },
          purpose: null
        }
      }
    ]);
    expect(await screen.findByRole('button', { name: 'Easy access' })).toBeInTheDocument();
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
      expect(screen.queryByRole('button', { name: 'Bills pot' })).not.toBeInTheDocument()
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
    const isa = screen.getByRole('button', { name: /^Cash ISA/ });
    // The Savings heading says what it is, so its subtitle starts with the rate
    expect(isa).toHaveTextContent('4.5%');
    expect(isa).not.toHaveTextContent('Savings ·');
    expect(isa).toHaveTextContent('Updated 5 weeks ago');
    expect(isa).toHaveTextContent('Kept out');
    await user.click(isa);

    // Its view, then Update balance
    const sheet = await screen.findByRole('dialog', { name: 'Cash ISA' });
    expect(sheet).toHaveTextContent('£8,650.00');
    await user.click(within(sheet).getByRole('button', { name: /Update balance/ }));
    const update = await screen.findByRole('dialog', { name: 'Update balance' });
    expect(within(update).getByLabelText('Balance now')).toHaveValue('8,650.00');
  });

  it('shows what each savings account is for under its name', async () => {
    renderAccounts();

    const row = await screen.findByRole('button', { name: /^Bills pot/ });
    expect(row).toHaveTextContent('For yearly bills');
    expect(screen.getByRole('button', { name: /^Current account/ })).toBeInTheDocument();
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
        category: 'BILLS',
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
        category: 'HOLIDAYS',
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

  it('leaves an account with nothing going out as a plain row, with nothing to open', async () => {
    // The hotel deposit's gone, so nothing comes out of the holiday account before payday
    const { user } = renderAccounts({ ...several(), oneOffPayments: [] });

    await user.click(await screen.findByRole('radio', { name: 'Before payday' }));

    const list = await screen.findByRole('region', { name: /Spending accounts/ });
    expect(within(list).getByText('Holiday spending')).toBeInTheDocument();
    expect(within(list).getByText('Nothing goes out before payday')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Holiday spending/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Holiday spending before payday' })
    ).not.toBeInTheDocument();
    // An account with payments still opens
    expect(screen.getByRole('button', { name: /Joint bills/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('says an account is already below £0, with nothing going out', async () => {
    const data = { ...several(), oneOffPayments: [] };
    data.accounts = data.accounts!.map(account =>
      account.id === 'holiday' ? { ...account, balance: -40 } : account
    );
    const { user } = renderAccounts(data);

    await user.click(await screen.findByRole('radio', { name: 'Before payday' }));

    const list = await screen.findByRole('region', { name: /Spending accounts/ });
    expect(within(list).getByText('Already below £0 (−£40.00)')).toBeInTheDocument();
    expect(within(list).queryByText('Nothing goes out before payday')).not.toBeInTheDocument();
  });

  it('warns when an account is already below £0 and more goes out', async () => {
    const data = several();
    data.accounts = data.accounts!.map(account =>
      account.id === 'holiday' ? { ...account, balance: -40 } : account
    );
    const { user } = renderAccounts(data);

    await user.click(await screen.findByRole('radio', { name: 'Before payday' }));

    const holiday = await screen.findByRole('button', { name: /Holiday spending/ });
    expect(holiday).toHaveTextContent('Already below £0, down to −£260.00 on Fri 23 Oct');
    expect(holiday).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('region', { name: 'Holiday spending before payday' })
    ).toHaveTextContent(
      'Already below £0 (−£40.00). Move money in to cover it before Fri 23 Oct, when it goes down to −£260.00.'
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
    const dialog = await screen.findByRole('dialog', { name: 'Where you get paid' });
    expect(dialog).toHaveTextContent(
      /Your pay goes into Joint bills from \w{3} \d{1,2} \w{3}\. Current account stops being where you get paid/
    );
    // Opened from the menu, so there's no way back to a view
    expect(within(dialog).queryByRole('button', { name: /^Back to/ })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Move my pay here' }));

    expect(await screen.findByText('Your pay goes into Joint bills now')).toBeInTheDocument();
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
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Add account' })).getByRole('button', {
        name: /Spending account/
      })
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add spending account' });
    await user.type(within(dialog).getByLabelText('Balance now'), '2105');
    await user.type(within(dialog).getByLabelText('Name'), 'Joint bills');
    // Spending accounts count unless switched out, and have no rate
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveTextContent(
      'counts in free to spend'
    );
    await user.click(within(dialog).getByRole('button', { name: /More options/ }));
    expect(within(dialog).getByRole('switch', { name: 'Count in free to spend' })).toBeChecked();
    expect(within(dialog).queryByLabelText('Rate (AER)')).not.toBeInTheDocument();
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

  it('adds a spending account that pay goes into from payday', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Add account' }));
    const chooser = await screen.findByRole('dialog', { name: 'Add account' });
    // Only an account to spend from can be where you get paid
    await user.click(within(chooser).getByRole('button', { name: /Savings account/ }));
    const savings = await screen.findByRole('dialog', { name: 'Add savings account' });
    expect(within(savings).queryByRole('switch', { name: 'Where you get paid' })).toBeNull();
    await user.click(within(savings).getByRole('button', { name: 'Back to account types' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Add account' })).getByRole('button', {
        name: /Spending account/
      })
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add spending account' });
    await user.type(within(dialog).getByLabelText('Balance now'), '400');
    await user.type(within(dialog).getByLabelText('Name'), 'New current');
    await user.click(within(dialog).getByRole('switch', { name: 'Where you get paid' }));
    expect(dialog).toHaveTextContent(
      /Your pay goes into New current from \w{3} \d{1,2} \w{3}\. Current account stops being where you get paid\./
    );
    // Where pay lands always counts, so there's no count switch
    expect(within(dialog).getAllByRole('switch')).toHaveLength(1);
    await user.click(within(dialog).getByRole('button', { name: 'Add account' }));

    expect(await screen.findByText('New current added')).toBeInTheDocument();
    expect(api.callsTo('CreateAccount')).toEqual([
      {
        input: expect.objectContaining({
          kind: 'SPENDING',
          name: 'New current',
          paidInto: true,
          counts: true
        })
      }
    ]);
  });
});

describe("an account's view", () => {
  it('updates the balance from the view, then goes back to it', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Cash ISA' }));
    const view = await screen.findByRole('dialog', { name: 'Cash ISA' });
    expect(view).toHaveTextContent('Savings · Updated 5 weeks ago');
    expect(within(view).getByRole('switch', { name: 'Count in free to spend' })).not.toBeChecked();
    await user.click(within(view).getByRole('button', { name: /Update balance/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Update balance' });
    // Kept out of free to spend, so the bank balance doesn't move
    expect(dialog).toHaveTextContent('Cash ISA is kept out of free to spend');
    await user.click(within(dialog).getByRole('button', { name: 'Back to Cash ISA' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Cash ISA' })).getByRole('button', {
        name: /Update balance/
      })
    );
    const again = await screen.findByRole('dialog', { name: 'Update balance' });
    await user.clear(within(again).getByLabelText('Balance now'));
    await user.type(within(again).getByLabelText('Balance now'), '8,700');
    await user.click(within(again).getByRole('button', { name: 'Save balance' }));

    expect(await screen.findByText('Cash ISA updated')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccountBalances')).toEqual([
      { input: { budgetId: 'budget-1', balances: [{ accountId: 'isa', balance: 8700 }] } }
    ]);
  });

  it('starts a payment moving money into the account', async () => {
    const { user } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Cash ISA' }));
    const view = await screen.findByRole('dialog', { name: 'Cash ISA' });
    await user.click(within(view).getByRole('button', { name: 'Move money into Cash ISA' }));

    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    expect(within(dialog).getByRole('radio', { name: 'Move money' })).toBeChecked();
    expect(within(dialog).getByRole('combobox', { name: 'Into' })).toHaveTextContent('Cash ISA');
  });

  it("doesn't offer moving money into where you get paid", async () => {
    const { user } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Current account' }));
    const view = await screen.findByRole('dialog', { name: 'Current account' });
    expect(view).toHaveTextContent('Where you get paid, so it always counts');
    expect(within(view).queryByRole('button', { name: /Move money into/ })).not.toBeInTheDocument();
  });
});

describe('savings interest', () => {
  // Easy access pays monthly on the 1st, so yesterday's is waiting to be checked; the ISA pays on
  // the 3rd, tomorrow
  const withInterest = (): FakeBudget => ({
    ...budget(),
    accounts: [
      savings({
        id: 'isa',
        name: 'Cash ISA',
        balance: 8650,
        interest: { rate: 4.5, frequency: 'MONTHLY', day: 3, nextDate: apiDate('2026-10-03') },
        balanceUpdatedAt: apiDate('2026-08-28')
      }),
      savings({
        id: 'easy',
        name: 'Easy access',
        balance: 4200,
        counts: true,
        interest: { rate: 4.1, frequency: 'MONTHLY', day: 1, nextDate: apiDate('2026-10-01') }
      })
    ]
  });

  it('says what’s built up, and checks a payment that’s waiting before adding it', async () => {
    const { user, api } = renderAccounts(withInterest());

    expect(
      await screen.findByText('About £30.25 interest so far · paid tomorrow')
    ).toBeInTheDocument();
    const banner = screen.getByRole('region', { name: 'Interest to check' });
    expect(banner).toHaveTextContent('Easy access interest was paid Thu 1 Oct');
    expect(banner).toHaveTextContent('About £14.09');
    await user.click(within(banner).getByRole('button', { name: 'Check interest' }));

    const dialog = await screen.findByRole('dialog', { name: 'Check interest' });
    expect(within(dialog).getByLabelText('Interest paid in')).toHaveValue('14.09');
    expect(dialog).toHaveTextContent('Our estimate is £14.09');
    // It counts, so the dashboard's bank balance moves too
    expect(dialog).toHaveTextContent('Bank balance on your dashboard');
    await user.clear(within(dialog).getByLabelText('Interest paid in'));
    await user.type(within(dialog).getByLabelText('Interest paid in'), '14.12');
    await user.click(within(dialog).getByRole('button', { name: 'Add £14.12' }));

    expect(await screen.findByText('Added £14.12 to Easy access')).toBeInTheDocument();
    expect(api.callsTo('ConfirmInterest')).toEqual([
      { input: { accountId: 'easy', amount: 14.12 } }
    ]);
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Interest to check' })).not.toBeInTheDocument()
    );
  });

  it('skips a month with no interest, without adding anything', async () => {
    const { user, api } = renderAccounts(withInterest());

    await user.click(await screen.findByRole('button', { name: 'Easy access' }));
    const view = await screen.findByRole('dialog', { name: 'Easy access' });
    await user.click(within(view).getByRole('button', { name: /^Check interest/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Check interest' });
    expect(within(dialog).getByRole('button', { name: 'Back to Easy access' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Skip Oct' }));

    expect(await screen.findByText('Skipped Easy access interest this time')).toBeInTheDocument();
    expect(api.callsTo('ConfirmInterest')).toEqual([
      { input: { accountId: 'easy', amount: null } }
    ]);
  });

  it('asks again tomorrow with Later', async () => {
    const { user, api } = renderAccounts(withInterest());

    await user.click(
      within(await screen.findByRole('region', { name: 'Interest to check' })).getByRole('button', {
        name: 'Check interest'
      })
    );
    const dialog = await screen.findByRole('dialog', { name: 'Check interest' });
    await user.click(within(dialog).getByRole('button', { name: 'Later' }));

    expect(await screen.findByText('It’ll be back tomorrow')).toBeInTheDocument();
    expect(api.callsTo('ConfirmInterest')).toEqual([]);
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Interest to check' })).not.toBeInTheDocument()
    );
  });

  it('says when interest is paid from its own small dialog', async () => {
    const { user, api } = renderAccounts();

    await user.click(await screen.findByRole('button', { name: 'Cash ISA' }));
    const view = await screen.findByRole('dialog', { name: 'Cash ISA' });
    await user.click(within(view).getByRole('button', { name: /^Interest/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Interest' });
    expect(within(dialog).getByLabelText('Rate (AER)')).toHaveValue('4.5');

    await user.click(within(dialog).getByRole('combobox', { name: 'Paid' }));
    await user.click(await screen.findByRole('option', { name: 'Monthly' }));
    await user.type(within(dialog).getByLabelText('Day of the month'), '3');
    expect(dialog).toHaveTextContent('About £31.79 on Sat 3 Oct, then each month.');
    await user.click(within(dialog).getByRole('button', { name: 'Save interest' }));

    expect(await screen.findByText('Cash ISA saved')).toBeInTheDocument();
    expect(api.callsTo('UpdateAccount')).toEqual([
      { id: 'isa', input: { interest: { rate: 4.5, frequency: 'MONTHLY', day: 3 } } }
    ]);
  });
});
