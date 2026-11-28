import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { apiDate } from '~/test/dates';
import { holdExitAnimations } from '~/test/exitAnimation';
import {
  createFakeApi,
  DEFAULT_BUDGET,
  FakeBudget,
  FakeRecurringPayment,
  freshBudget
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

const budget = (): FakeBudget =>
  freshBudget({
    recurringPayments: [...structuredClone(DEFAULT_BUDGET.recurringPayments), carFinance]
  });

const renderAt = (route: string) => renderApp({ route, budget: budget() });

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
  it('turns the form into a debt from What is it?', async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    expect(within(dialog).getByRole('radio', { name: 'Payment' })).toBeChecked();
    expect(dialog).toHaveTextContent('A bill, subscription or money to someone else.');
    expect(within(dialog).queryByLabelText('Balance left')).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Name'), 'Personal loan');
    await user.type(within(dialog).getByLabelText('Amount'), '100');
    await user.click(within(dialog).getByRole('radio', { name: 'Debt' }));

    // Always money out, ending when it's paid off
    expect(within(dialog).queryByRole('group', { name: 'Type' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('radio', { name: 'Renews' })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent('A loan or card. Shows on Debts with a payoff date.');
    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent(
      'Finances'
    );
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'paid off shown once you add the balance'
    );

    // The debt's figures are straight under the choice
    await user.type(within(dialog).getByLabelText('Balance left'), '1200');
    await user.type(within(dialog).getByLabelText('Interest (APR)'), '0');
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'paid off about Oct 2027 at £100 a month'
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

  it('only asks what it is for money going out', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));

    expect(within(dialog).queryByRole('radio', { name: 'Debt' })).not.toBeInTheDocument();
  });

  it('says when a payment would never clear the debt', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Amount'), '5');
    await user.click(within(dialog).getByRole('radio', { name: 'Debt' }));
    await user.type(within(dialog).getByLabelText('Balance left'), '1200');
    await user.type(within(dialog).getByLabelText('Interest (APR)'), '12');

    expect(within(dialog).getByRole('status')).toHaveTextContent(
      '£5 doesn’t cover the £12 interest, so it will grow'
    );
  });
});

// A mortgage with its fixed rate ending on a given day
const mortgageEnding = (rateEndsOn: string | null): FakeRecurringPayment => ({
  id: 'mortgage',
  name: 'Mortgage',
  amount: 750,
  category: 'FINANCES',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2025-10-28'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  debt: {
    balance: 148200,
    startingBalance: 165000,
    apr: 4.29,
    balanceUpdatedAt: null,
    rateEndsOn: rateEndsOn ? apiDate(rateEndsOn) : null
  }
});

const mortgageBudget = (rateEndsOn: string | null): FakeBudget =>
  freshBudget({ recurringPayments: [mortgageEnding(rateEndsOn)] });

describe('adding a debt with a rate end', () => {
  const openAdd = async () => {
    const view = renderAt('/debts');
    await view.user.click(await screen.findByRole('button', { name: 'Add a debt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a debt' });
    await view.user.type(within(dialog).getByLabelText('Name'), 'Home loan');
    await view.user.type(within(dialog).getByLabelText('Amount'), '750');
    await view.user.type(within(dialog).getByLabelText('Balance left'), '148200');
    await view.user.type(within(dialog).getByLabelText('Interest (APR)'), '4.29');
    return { ...view, dialog };
  };

  it('asks when the rate ends under the APR, optionally, and says why', async () => {
    const { dialog } = await openAdd();

    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Optional');
    expect(
      within(dialog).getByText(
        'When a fixed or offer rate ends, like a mortgage fix or a 0% card. You’ll get a reminder before.'
      )
    ).toBeInTheDocument();
    // Nothing to remind about until there is a date
    const more = within(dialog).getByRole('button', { name: /More options/ });
    expect(more).not.toHaveTextContent('rate ends');
  });

  it('reminds 3 months before by default, under More options, and sends the date', async () => {
    const { user, api, dialog } = await openAdd();

    await user.click(within(dialog).getByLabelText('Rate ends'));
    await user.click(await screen.findByRole('button', { name: 'Friday, 30 October 2026' }));
    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Fri 30 Oct');

    const more = within(dialog).getByRole('button', { name: /More options/ });
    expect(more).toHaveTextContent('3 months before the rate ends');
    await user.click(more);
    const reminder = within(dialog).getByRole('combobox', {
      name: 'Remind me before the rate ends'
    });
    expect(reminder).toHaveTextContent('3 months before');
    await user.click(reminder);
    expect((await screen.findAllByRole('option')).map(option => option.textContent)).toEqual([
      '1 week before',
      '2 weeks before',
      '1 month before',
      '3 months before',
      'Off'
    ]);
    await user.keyboard('{Escape}');

    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Home loan')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')[0].input).toMatchObject({
      debt: { balance: 148200, apr: 4.29, rateEndsOn: '2026-10-30' },
      renewalReminder: { off: false, days: 90 }
    });
  });

  it('sends the reminder that was chosen', async () => {
    const { user, api, dialog } = await openAdd();
    await user.click(within(dialog).getByLabelText('Rate ends'));
    await user.click(await screen.findByRole('button', { name: 'Friday, 30 October 2026' }));
    await user.click(within(dialog).getByRole('button', { name: /More options/ }));
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Remind me before the rate ends' })
    );
    await user.click(await screen.findByRole('option', { name: 'Off' }));
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveTextContent(
      'no rate end reminder'
    );

    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Home loan')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')[0].input).toMatchObject({
      renewalReminder: { off: true, days: null }
    });
  });

  it('sends no rate end without one', async () => {
    const { user, api, dialog } = await openAdd();

    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Home loan')).toBeInTheDocument();
    const input = api.callsTo('CreateRecurringPayment')[0].input as {
      debt: object;
      renewalReminder: object;
    };
    expect(input.debt).not.toHaveProperty('rateEndsOn');
    expect(input.renewalReminder).toEqual({ off: false, days: null });
  });

  it('leaves 3 months out of the reminder before a renewal', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('radio', { name: 'Renews' }));
    await user.click(within(dialog).getByRole('button', { name: /More options/ }));
    await user.click(within(dialog).getByRole('combobox', { name: 'Remind me before it renews' }));

    expect((await screen.findAllByRole('option')).map(option => option.textContent)).toEqual([
      'Usual · 1 month before',
      '1 week before',
      '2 weeks before',
      '1 month before',
      'Off'
    ]);
  });
});

describe('editing a debt with a rate end', () => {
  it('shows the date and its reminder, and clearing the date stops the reminder', async () => {
    const { user, api } = renderApp({ route: '/recurring', budget: mortgageBudget('2026-12-31') });

    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });

    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Thu 31 Dec');
    // The usual timing for a rate end is 3 months before, so More options starts folded
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveTextContent(
      '3 months before the rate ends'
    );
    expect(within(dialog).queryByText(/The rate ended on/)).not.toBeInTheDocument();

    await user.click(within(dialog).getByLabelText('Rate ends'));
    await user.click(await screen.findByRole('button', { name: 'Clear' }));
    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Optional');
    expect(within(dialog).getByRole('button', { name: /More options/ })).not.toHaveTextContent(
      'rate ends'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      debt: { balance: 148200, apr: 4.29, startingBalance: 165000, rateEndsOn: null },
      renewalReminder: { off: false, days: null }
    });
  });

  it('opens More options when the reminder isn’t the usual 3 months', async () => {
    const data = mortgageBudget('2026-12-31');
    data.recurringPayments[0].renewalReminder = { off: false, days: 14 };
    const { user } = renderApp({ route: '/recurring', budget: data });

    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });

    expect(
      within(dialog).getByRole('combobox', { name: 'Remind me before the rate ends' })
    ).toHaveTextContent('2 weeks before');
  });

  it('sends nothing for a debt whose form is left as it was', async () => {
    const { user, api } = renderApp({ route: '/recurring', budget: mortgageBudget('2026-12-31') });

    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Edit recurring payment' })).toBeNull()
    );
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([]);
  });
});

describe('a rate end that has gone by', () => {
  // The rate ended on Monday 28 September, before today
  const openEdit = async (width?: number) => {
    if (width) setViewportWidth(width);
    const view = renderApp({ route: '/recurring', budget: mortgageBudget('2026-09-28') });
    await editFromRow(view.user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    return { ...view, dialog };
  };

  it('asks about the new rate at the top of the form', async () => {
    const { dialog } = await openEdit();

    const prompt = within(dialog)
      .getByText(/The rate ended on/)
      .closest<HTMLElement>('[role="status"]')!;
    expect(prompt).toHaveTextContent(
      'The rate ended on Mon 28 Sep. Update the APR and payment, then set when the new rate ends.'
    );
    expect(within(prompt).getByRole('button', { name: 'Set new rate end' })).toBeInTheDocument();
    expect(within(prompt).getByRole('button', { name: 'No end date' })).toBeInTheDocument();
    // First in the form, above the name
    expect(
      prompt.compareDocumentPosition(within(dialog).getByLabelText('Name')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    // Not a reminder to set, as the rate has ended
    expect(within(dialog).getByRole('button', { name: /More options/ })).not.toHaveTextContent(
      'rate ends'
    );
  });

  it('moves on a year with Set new rate end, which is then saved', async () => {
    const { user, api, dialog } = await openEdit();

    await user.click(within(dialog).getByRole('button', { name: 'Set new rate end' }));

    expect(within(dialog).queryByText(/The rate ended on/)).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Tue 28 Sep 2027');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      debt: { rateEndsOn: '2027-09-28' },
      renewalReminder: { off: false, days: 90 }
    });
  });

  it('clears the rate end with No end date', async () => {
    const { user, api, dialog } = await openEdit();

    await user.click(within(dialog).getByRole('button', { name: 'No end date' }));

    expect(within(dialog).queryByText(/The rate ended on/)).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Optional');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      debt: { rateEndsOn: null }
    });
  });

  it('asks in the mobile sheet too', async () => {
    const { user, dialog } = await openEdit(390);

    expect(within(dialog).getByText(/The rate ended on Mon 28 Sep./)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Set new rate end' }));
    expect(within(dialog).getByLabelText('Rate ends')).toHaveTextContent('Tue 28 Sep 2027');
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
        interest: { rate: 4.5, frequency: null, day: null, nextDate: null },
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      },
      {
        id: 'easy',
        name: 'Easy access',
        kind: 'SAVINGS',
        balance: 4200,
        counts: true,
        interest: null,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      }
    ]
  });

  it('pays a new recurring expense into a savings account, saying what that means', async () => {
    const { user, api } = renderApp({
      route: '/recurring',
      budget: withSavings()
    });

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Name'), 'ISA top-up');
    await user.type(within(dialog).getByLabelText('Amount'), '250');
    await user.click(within(dialog).getByRole('radio', { name: 'Move money' }));

    // Not a debt as well
    expect(within(dialog).queryByLabelText('Balance left')).not.toBeInTheDocument();
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
      budget: withSavings()
    });

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('radio', { name: 'Move money' }));
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
    expect(within(dialog).getByRole('radio', { name: 'Payment' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('radio', { name: 'Move money' })).not.toBeInTheDocument();
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
        interest: null,
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      },
      {
        id: 'isa',
        name: 'Cash ISA',
        kind: 'SAVINGS',
        balance: 8650,
        counts: false,
        interest: { rate: 4.5, frequency: null, day: null, nextDate: null },
        purpose: null,
        balanceUpdatedAt: String(Date.now())
      }
    ]
  });
  const openAdd = async () => {
    const rendered = renderApp({
      route: '/recurring',
      budget: withJoint()
    });
    await rendered.user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    return { ...rendered, dialog };
  };

  it('says which account a payment comes out of, starting on where you get paid', async () => {
    const { user, api, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText('Name'), 'Energy');
    await user.type(within(dialog).getByLabelText('Amount'), '120');
    const more = within(dialog).getByRole('button', { name: /More options/ });
    expect(more).toHaveTextContent('From Current account · remind 1 day before');
    expect(within(dialog).queryByRole('combobox', { name: 'From' })).not.toBeInTheDocument();
    await user.click(more);
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
    expect(more).toHaveTextContent('From Joint bills');
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    expect(await screen.findByText('Added Energy')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')).toEqual([
      { input: expect.objectContaining({ name: 'Energy', account: 'joint' }) }
    ]);
  });

  it('moves money into another account to spend from, keeping its category', async () => {
    const { user, dialog } = await openAdd();
    await user.click(within(dialog).getByRole('radio', { name: 'Move money' }));

    expect(within(dialog).getByRole('combobox', { name: 'Into' })).toHaveTextContent('Joint bills');
    expect(dialog).toHaveTextContent(
      'Joint bills counts in free to spend, so this only moves money between your accounts. It’s left out of your monthly totals.'
    );
    expect(within(dialog).getByLabelText('Category')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('combobox', { name: 'Into' }));
    expect(await screen.findByRole('option', { name: 'Cash ISA' })).toHaveTextContent(
      'Savings · £8,650.00 · kept out of free to spend'
    );
  });

  it('lands an income in an account', async () => {
    const { user, dialog } = await openAdd();
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));
    await user.click(within(dialog).getByRole('button', { name: /More options/ }));

    await user.click(within(dialog).getByRole('combobox', { name: 'Into' }));
    // Income can land in savings
    await user.click(await screen.findByRole('option', { name: 'Cash ISA' }));
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveTextContent(
      'Into Cash ISA'
    );
  });
});

describe('adding a debt from Debts', () => {
  it('is always a debt, with nothing to choose', async () => {
    const { user, api } = renderAt('/debts');

    await user.click(await screen.findByRole('button', { name: 'Add a debt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a debt' });

    expect(within(dialog).queryByRole('radio', { name: 'Payment' })).not.toBeInTheDocument();
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

    expect(within(dialog).getByRole('radio', { name: 'Debt' })).toBeChecked();
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

  it('stops tracking it when it becomes a payment', async () => {
    const { user, api } = renderAt('/recurring');

    await editFromRow(user, 'Car finance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('radio', { name: 'Payment' }));

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

describe('more options', () => {
  it('folds the reminders away, saying what they are', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    const more = within(dialog).getByRole('button', { name: /More options/ });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveTextContent('remind 1 day before');
    expect(within(dialog).queryByLabelText('Remind me before it’s due')).not.toBeInTheDocument();

    await user.click(more);
    expect(within(dialog).getByLabelText('Remind me before it’s due')).toBeInTheDocument();
  });

  it('says where an edited payment stands under the title', async () => {
    const { user } = renderAt('/recurring');

    await editFromRow(user, 'Car finance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    expect(dialog).toHaveTextContent(/(Unpaid|Paid|Skipped|Ended) · /);
    expect(within(dialog).queryByRole('button', { name: /Mark .*paid/ })).not.toBeInTheDocument();
  });
});

// Saturday 24 October: the budget moves weekend dates to the next working day
describe('a payment on a weekend', () => {
  const insurance: FakeRecurringPayment = {
    id: 'insurance',
    name: 'Van insurance',
    amount: 52,
    category: 'FINANCES',
    frequency: 'MONTHLY',
    type: 'EXPENSE',
    firstPaymentDate: apiDate('2026-01-24'),
    lastPaymentDate: null,
    nextDueDate: null,
    thisCycle: [],
    renewalDate: null
  };
  const renderWith = (payment: FakeRecurringPayment) =>
    renderApp({
      route: '/recurring',
      api: createFakeApi({
        budget: { ...budget(), nonWorkingDay: 'NEXT', recurringPayments: [payment] }
      })
    });

  it('says on its row when it goes out instead, and why', async () => {
    const { user } = renderWith(insurance);

    const moved = await screen.findByText('Moved from Sat 24 Oct');
    expect(screen.getByText('Mon 26 Oct')).toBeInTheDocument();
    await user.hover(moved);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Sat 24 Oct is a SaturdaySo it goes out the next working day, Mon 26 Oct'
    );
  });

  it('can have its own choice, under More options', async () => {
    const { user, api } = renderWith(insurance);

    await editFromRow(user, 'Van insurance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    const more = within(dialog).getByRole('button', { name: /More options/ });
    // Following the usual choice, there's nothing to show
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await user.click(more);

    const field = within(dialog).getByRole('combobox', { name: 'On a weekend or bank holiday' });
    expect(field).toHaveTextContent('Usual · next working day');
    expect(dialog).toHaveTextContent(
      'Sat 24 Oct is a Saturday, so it goes out the next working day, Mon 26 Oct.'
    );

    await user.click(field);
    await user.click(await screen.findByRole('option', { name: 'Working day before' }));
    expect(dialog).toHaveTextContent(
      'Sat 24 Oct is a Saturday, so it goes out the working day before, Fri 23 Oct.'
    );
    expect(more).toHaveTextContent('weekends move to the working day before');

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Saved Van insurance')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      nonWorkingDay: 'BEFORE'
    });
    expect(await screen.findByText('Fri 23 Oct')).toBeInTheDocument();
  });

  it('opens More options by itself when the payment has its own choice', async () => {
    const { user } = renderWith({ ...insurance, nonWorkingDay: 'ON_DAY' });

    // Going out on the day, so nothing moves
    expect(await screen.findByText('Sat 24 Oct')).toBeInTheDocument();
    expect(screen.queryByText(/Moved from/)).not.toBeInTheDocument();

    await editFromRow(user, 'Van insurance');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(
      within(dialog).getByRole('combobox', { name: 'On a weekend or bank holiday' })
    ).toHaveTextContent('On the day');
  });
});

describe('a logo', () => {
  const NETFLIX = 'https://www.google.com/s2/favicons?sz=128&domain=netflix.com';

  const openMore = async (user: ReturnType<typeof renderAt>['user']) => {
    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    const more = within(dialog).getByRole('button', { name: /More options/ });
    if (more.getAttribute('aria-expanded') === 'false') await user.click(more);
    return { dialog, more };
  };

  it('uses a website’s icon in place of the letter, set under More options', async () => {
    const { user, api } = renderAt('/recurring');
    const { dialog, more } = await openMore(user);

    await user.type(within(dialog).getByLabelText('Logo'), 'netflix.com');
    expect(dialog).toHaveTextContent('Using netflix.com’s icon.');
    expect(more).toHaveTextContent('logo from netflix.com');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({ iconUrl: NETFLIX });
    expect(document.querySelector(`img[src="${NETFLIX}"]`)).not.toBeNull();
  });

  it('says when a logo won’t load, shows the letter, and still saves it', async () => {
    const { user, api } = renderAt('/recurring');
    const { dialog } = await openMore(user);
    const link = 'https://example.com/missing.png';

    await user.type(within(dialog).getByLabelText('Logo'), link);
    fireEvent.error(dialog.querySelector(`img[src="${link}"]`)!);
    expect(dialog).toHaveTextContent(
      'Couldn’t load a logo from this, so the letter shows instead.'
    );
    expect(dialog.querySelector(`img[src="${link}"]`)).toBeNull();

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({ iconUrl: link });
  });

  it('won’t save something that isn’t a website or a link', async () => {
    const { user, api } = renderAt('/recurring');
    const { dialog } = await openMore(user);

    await user.type(within(dialog).getByLabelText('Logo'), 'netflix');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(dialog).toHaveTextContent('Type a website, or a link that starts https://');
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([]);
  });

  it('opens More options with the website of a saved logo, and × takes it off', async () => {
    const data = budget();
    data.recurringPayments.find(payment => payment.name === 'Mortgage')!.iconUrl = NETFLIX;
    const { user, api } = renderApp({ route: '/recurring', budget: data });

    await editFromRow(user, 'Mortgage');
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    expect(within(dialog).getByRole('button', { name: /More options/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(within(dialog).getByLabelText('Logo')).toHaveValue('netflix.com');

    await user.click(within(dialog).getByRole('button', { name: 'Remove the logo' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({ iconUrl: null });
  });
});
