import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { holdExitAnimations } from '~/test/exitAnimation';
import {
  apiDate,
  createFakeApi,
  DEFAULT_BUDGET,
  FakeBudget,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { editFromRow } from '~/test/paymentRow';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => vi.useRealTimers());

const carFinance: FakeRecurringPayment = {
  id: 'car-finance',
  name: 'Car finance',
  amount: 245,
  category: 'FINANCES',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-15'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  debt: { balance: 6860, startingBalance: 12000, apr: 6.9, balanceUpdatedAt: null }
};

const budget = (): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  recurringPayments: [...structuredClone(DEFAULT_BUDGET.recurringPayments), carFinance]
});

const renderAt = (route: string) => renderApp({ route, api: createFakeApi({ budget: budget() }) });

describe('choosing a category', () => {
  const openAdd = async () => {
    const view = renderAt('/recurring');
    await view.user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    return {
      ...view,
      dialog: await screen.findByRole('dialog', { name: 'Add recurring payment' })
    };
  };

  const offered = async (user: ReturnType<typeof renderAt>['user'], dialog: HTMLElement) => {
    await user.click(within(dialog).getByRole('combobox', { name: 'Category' }));
    const names = (await screen.findAllByRole('option')).map(option => option.textContent);
    await user.keyboard('{Escape}');
    return names;
  };

  it('offers the categories for money out, without Income', async () => {
    const { user, dialog } = await openAdd();

    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent(
      'Subscriptions'
    );
    const names = await offered(user, dialog);
    expect(names).toContain('Eating out');
    expect(names).toContain('Groceries');
    expect(names).not.toContain('Income');
  });

  it('offers only the categories for money in, moving to Income', async () => {
    const { user, dialog } = await openAdd();
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));

    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent('Income');
    expect(await offered(user, dialog)).toEqual([
      'Expenses',
      'General',
      'Gifts',
      'Income',
      'Transfers'
    ]);
  });
});

describe('adding a recurring payment as a debt', () => {
  it('turns the form into a debt with the switch', async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    const track = within(dialog).getByRole('switch', { name: 'Track as a debt' });
    expect(track).not.toBeChecked();
    expect(within(dialog).queryByLabelText('Balance left')).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Name'), 'Personal loan');
    await user.type(within(dialog).getByLabelText('Amount'), '100');
    await user.click(track);

    // Always money out, ending when it's paid off
    expect(within(dialog).queryByRole('group', { name: 'Type' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('radio', { name: 'Renews' })).not.toBeInTheDocument();
    expect(within(dialog).getByText('When it’s paid off')).toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent(
      'Finances'
    );
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Paid offShown once you add the balance'
    );

    // The debt's figures are in the switch's card
    const details = within(dialog).getByRole('group', { name: 'Track as a debt' });
    await user.type(within(details).getByLabelText('Balance left'), '1200');
    await user.type(within(details).getByLabelText('Interest (APR)'), '0');
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Paid offAbout Oct 2027 at £100 a month'
    );

    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    expect(await screen.findByText('Added Personal loan')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')).toEqual([
      {
        input: expect.objectContaining({
          name: 'Personal loan',
          amount: 100,
          type: 'EXPENSE',
          category: 'FINANCES',
          lastPaymentDate: null,
          renewalDate: null,
          debt: { balance: 1200, apr: 0, startingBalance: null }
        })
      }
    ]);
  });

  it('only offers the switch for money going out', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));

    expect(
      within(dialog).queryByRole('switch', { name: 'Track as a debt' })
    ).not.toBeInTheDocument();
  });

  it('says when a payment would never clear the debt', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Amount'), '5');
    await user.click(within(dialog).getByRole('switch', { name: 'Track as a debt' }));
    await user.type(within(dialog).getByLabelText('Balance left'), '1200');
    await user.type(within(dialog).getByLabelText('Interest (APR)'), '12');

    expect(within(dialog).getByRole('status')).toHaveTextContent(
      "Not at £5 a month: it doesn't cover the interest"
    );
  });
});

describe('paying into savings', () => {
  const withSavings = (): FakeBudget => ({
    ...budget(),
    accounts: [
      {
        id: 'isa',
        name: 'Cash ISA',
        kind: 'SAVINGS',
        balance: 8650,
        counts: false,
        interestRate: 4.5,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      },
      {
        id: 'easy',
        name: 'Easy access',
        kind: 'SAVINGS',
        balance: 4200,
        counts: true,
        interestRate: null,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      }
    ]
  });

  it('pays a new recurring expense into a savings account, saying what that means', async () => {
    const { user, api } = renderApp({
      route: '/recurring',
      api: createFakeApi({ budget: withSavings() })
    });

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Name'), 'ISA top-up');
    await user.type(within(dialog).getByLabelText('Amount'), '250');
    await user.click(within(dialog).getByRole('switch', { name: 'Pays into savings' }));

    // Not a debt as well
    expect(
      within(dialog).queryByRole('switch', { name: 'Track as a debt' })
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Into' })).toHaveTextContent('Cash ISA');
    expect(dialog).toHaveTextContent('When it’s marked paid, £250.00 is added to Cash ISA.');

    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    expect(await screen.findByText('Added ISA top-up')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')).toEqual([
      { input: expect.objectContaining({ name: 'ISA top-up', paysInto: 'isa' }) }
    ]);
  });

  it('says a payment into savings that counts only moves money', async () => {
    const { user } = renderApp({
      route: '/recurring',
      api: createFakeApi({ budget: withSavings() })
    });

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('switch', { name: 'Pays into savings' }));
    await user.click(within(dialog).getByRole('combobox', { name: 'Into' }));
    await user.click(await screen.findByRole('option', { name: 'Easy access' }));

    expect(dialog).toHaveTextContent(
      'Easy access counts in free to spend, so this only moves money between your accounts.'
    );
  });

  it('isn’t offered without savings, or for income', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    expect(
      within(dialog).queryByRole('switch', { name: 'Pays into savings' })
    ).not.toBeInTheDocument();
  });
});

describe('several accounts to spend from', () => {
  const withJoint = (): FakeBudget => ({
    ...budget(),
    accounts: [
      {
        id: 'joint',
        name: 'Joint bills',
        kind: 'SPENDING',
        balance: 2105,
        counts: true,
        interestRate: null,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      },
      {
        id: 'isa',
        name: 'Cash ISA',
        kind: 'SAVINGS',
        balance: 8650,
        counts: false,
        interestRate: 4.5,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      }
    ]
  });
  const openAdd = async () => {
    const rendered = renderApp({
      route: '/recurring',
      api: createFakeApi({ budget: withJoint() })
    });
    await rendered.user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    return { ...rendered, dialog };
  };

  it('says which account a payment comes out of, starting on where you get paid', async () => {
    const { user, api, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText('Name'), 'Energy');
    await user.type(within(dialog).getByLabelText('Amount'), '120');
    expect(within(dialog).getByRole('combobox', { name: 'From' })).toHaveTextContent(
      'Current account'
    );

    await user.click(within(dialog).getByRole('combobox', { name: 'From' }));
    // Only accounts to spend from
    expect(screen.queryByRole('option', { name: 'Cash ISA' })).not.toBeInTheDocument();
    // Each says what kind of account it is and its balance
    expect(await screen.findByRole('option', { name: 'Joint bills' })).toHaveTextContent(
      'Joint billsSpending · £2,105.00'
    );
    expect(screen.getByRole('option', { name: 'Current account' })).toHaveTextContent(
      /Where you get paid · £/
    );
    await user.click(screen.getByRole('option', { name: 'Joint bills' }));
    expect(dialog).toHaveTextContent('Comes off Joint bills when it’s marked paid');
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    expect(await screen.findByText('Added Energy')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')).toEqual([
      { input: expect.objectContaining({ name: 'Energy', account: 'joint' }) }
    ]);
  });

  it('moves money into another account to spend from, keeping its category', async () => {
    const { user, dialog } = await openAdd();
    await user.click(
      within(dialog).getByRole('switch', { name: 'Moves money to another account' })
    );

    expect(within(dialog).getByRole('combobox', { name: 'Into' })).toHaveTextContent('Joint bills');
    expect(dialog).toHaveTextContent(
      'Joint bills counts in free to spend, so this only moves money between your accounts. It’s left out of your monthly totals.'
    );
    expect(within(dialog).getByLabelText('Category')).toBeInTheDocument();
    // The summary says where it goes
    expect(within(dialog).getByRole('status')).toHaveTextContent('IntoJoint bills');

    await user.click(within(dialog).getByRole('combobox', { name: 'Into' }));
    expect(await screen.findByRole('option', { name: 'Cash ISA' })).toHaveTextContent(
      'Savings · £8,650.00 · kept out of free to spend'
    );
  });

  it('lands an income in an account', async () => {
    const { user, dialog } = await openAdd();
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));

    await user.click(within(dialog).getByRole('combobox', { name: 'Into' }));
    // Income can land in savings
    await user.click(await screen.findByRole('option', { name: 'Cash ISA' }));
    expect(dialog).toHaveTextContent('Goes into Cash ISA when it’s marked paid');
  });
});

describe('adding a debt from Debts', () => {
  it('is always a debt, with no switch', async () => {
    const { user, api } = renderAt('/debts');

    await user.click(await screen.findByRole('button', { name: 'Add a debt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a debt' });

    expect(within(dialog).queryByRole('switch')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('group', { name: 'Type' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent(
      'Finances'
    );
    expect(within(dialog).getByLabelText('Name')).toHaveAttribute(
      'placeholder',
      'e.g. Credit card'
    );

    await user.type(within(dialog).getByLabelText('Name'), 'Store card');
    await user.type(within(dialog).getByLabelText('Amount'), '40');
    expect(within(dialog).getByRole('button', { name: 'Add debt' })).toBeDisabled();

    // What's owed and the rate are needed for the payoff date
    await user.click(within(dialog).getByLabelText('Balance left'));
    await user.click(within(dialog).getByLabelText('Interest (APR)'));
    await user.type(within(dialog).getByLabelText('Interest (APR)'), '120');
    await user.tab();
    expect(within(dialog).getByText('Enter what you owe now')).toBeInTheDocument();
    expect(within(dialog).getByText('Enter a rate from 0 to 100%')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Balance left'), '600');
    await user.clear(within(dialog).getByLabelText('Interest (APR)'));
    await user.type(within(dialog).getByLabelText('Interest (APR)'), '29.9');
    await user.type(within(dialog).getByLabelText('Starting balance'), '900');
    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Store card')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')[0].input).toMatchObject({
      category: 'FINANCES',
      debt: { balance: 600, apr: 29.9, startingBalance: 900 }
    });
    expect(
      within(await screen.findByRole('table', { name: 'Debts' })).getByText('Store card')
    ).toBeInTheDocument();
  });
});

describe('editing a debt', () => {
  it("starts with the debt's figures and sends a new balance", async () => {
    const { user, api } = renderAt('/recurring');

    await editFromRow(user, 'Car finance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });

    expect(within(dialog).getByRole('switch', { name: 'Track as a debt' })).toBeChecked();
    expect(within(dialog).getByLabelText('Balance left')).toHaveValue('6,860.00');
    expect(within(dialog).getByLabelText('Interest (APR)')).toHaveValue('6.9');
    expect(within(dialog).getByLabelText('Starting balance')).toHaveValue('12,000.00');

    await user.clear(within(dialog).getByLabelText('Balance left'));
    await user.type(within(dialog).getByLabelText('Balance left'), '6500');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Car finance')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      {
        id: 'car-finance',
        input: expect.objectContaining({
          debt: { balance: 6500, apr: 6.9, startingBalance: 12000 }
        })
      }
    ]);
  });

  it('stops tracking it when the switch is turned off', async () => {
    const { user, api } = renderAt('/recurring');

    await editFromRow(user, 'Car finance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('switch', { name: 'Track as a debt' }));

    expect(within(dialog).getByRole('group', { name: 'Type' })).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: 'Stops' })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Car finance')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({ debt: null });
  });

  it("doesn't send anything for a payment that was never a debt", async () => {
    const { user, api } = renderAt('/recurring');

    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.clear(within(dialog).getByLabelText('Amount'));
    await user.type(within(dialog).getByLabelText('Amount'), '800');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).not.toHaveProperty('debt');
  });
});

describe('closing the payment dialog', () => {
  it('keeps showing the payment while the sheet slides away', async () => {
    setViewportWidth(390);
    holdExitAnimations();
    const { user } = renderAt('/recurring');

    // On mobile a payment opens its sheet first, with Edit payment for the full form
    await user.click(await screen.findByRole('button', { name: 'Car finance' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Car finance' })).getByRole('button', {
        name: 'Edit payment'
      })
    );
    const sheet = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(sheet).getByRole('button', { name: 'Cancel' }));

    // Still on screen while it animates away, as the payment it was, not a new one or the chooser
    // (the payment's own sheet is closing too, behind it)
    const closing = await screen.findByRole('dialog', {
      hidden: true,
      name: 'Edit recurring payment'
    });
    expect(closing).toHaveAttribute('data-state', 'closed');
    expect(within(closing).getByLabelText('Name')).toHaveValue('Car finance');
    expect(within(closing).queryByText('What are you adding?')).not.toBeInTheDocument();
  });

  it('starts afresh each time it opens', async () => {
    const { user } = renderAt('/recurring');

    await editFromRow(user, 'Car finance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.clear(within(dialog).getByLabelText('Name'));
    await user.type(within(dialog).getByLabelText('Name'), 'Not saved');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await editFromRow(user, 'Car finance');
    expect(
      within(await screen.findByRole('dialog', { name: 'Edit recurring payment' })).getByLabelText(
        'Name'
      )
    ).toHaveValue('Car finance');
  });
});
