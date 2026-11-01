import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import {
  apiDate,
  apiDateFromToday,
  createFakeApi,
  DEFAULT_BUDGET,
  FakeBudget,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026; payday is Friday 30 October. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => {
  vi.useRealTimers();
  resetViewport();
});

const recurring = (
  fields: Partial<FakeRecurringPayment> & Pick<FakeRecurringPayment, 'id' | 'name'>
): FakeRecurringPayment => ({
  amount: 20,
  category: 'BILLS',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-02'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  ...fields
});

const budget = (): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  // Started today, so the payday prompt stays away
  cycleStartedOn: apiDateFromToday(0),
  bankBalance: 2000,
  recurringPayments: [
    // Every Wednesday: 7, 14, 21 and 28 October fall before payday
    recurring({
      id: 'cleaner',
      name: 'Cleaner',
      amount: 50,
      frequency: 'WEEKLY',
      firstPaymentDate: apiDate('2026-01-07')
    }),
    // The 26th of each month
    recurring({
      id: 'loan',
      name: 'Car loan',
      amount: 245,
      category: 'FINANCES',
      firstPaymentDate: apiDate('2026-01-26')
    })
  ],
  oneOffPayments: [
    {
      id: 'birthday',
      name: 'Birthday',
      amount: 75,
      dueDate: apiDateFromToday(5),
      type: 'EXPENSE',
      category: 'GIFTS'
    },
    {
      id: 'dentist',
      name: 'Dentist',
      amount: 40,
      dueDate: apiDateFromToday(-1),
      type: 'EXPENSE',
      category: 'PERSONAL_CARE',
      paidAt: apiDateFromToday(-1)
    }
  ],
  notes: []
});

const renderDashboard = () => {
  const api = createFakeApi({ budget: budget() });
  return { ...renderApp({ route: '/dashboard', api }), api };
};

const fromMenu = async (user: UserEvent, { payment, item }: { payment: string; item: string }) => {
  await user.click(await screen.findByRole('button', { name: `More actions for ${payment}` }));
  await user.click(await screen.findByRole('menuitem', { name: item }));
};

describe('quick edits on desktop', () => {
  it('changes a payment’s amount from now on, showing what it does to free to spend', async () => {
    const { user, api } = renderDashboard();

    await fromMenu(user, { payment: 'Cleaner', item: 'Change amount' });
    const dialog = await screen.findByRole('dialog', { name: 'Change amount' });
    const field = within(dialog).getByLabelText('New amount');
    expect(field).toHaveValue('50.00');
    expect(field).toHaveFocus();
    expect(dialog).toHaveTextContent('This payment and every one after.');
    // Nothing to save until it's different
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();

    await user.clear(field);
    await user.type(field, '60');
    // Four more Wednesdays before payday, £10 more each
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Free to spend£1,480.00 → £1,440.00'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Cleaner is now £60.00')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0]).toEqual({
      id: 'cleaner',
      input: { amount: 60 }
    });
  });

  it('moves a payment’s day, so the schedule carries on from the new date', async () => {
    const { user, api } = renderDashboard();

    await fromMenu(user, { payment: 'Car loan', item: 'Change date' });
    const dialog = await screen.findByRole('dialog', { name: 'Change date' });
    const field = within(dialog).getByRole('button', { name: 'New date' });
    // It opens on the payment's next date, and can't go before today
    expect(field).toHaveTextContent('Mon 26 Oct');
    expect(dialog).toHaveTextContent('This payment and every one after move to the new day.');
    expect(within(dialog).getByRole('button', { name: 'Change date' })).toBeDisabled();
    await user.click(field);
    expect(await screen.findByRole('button', { name: 'Thursday, 1 October 2026' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Friday, 30 October 2026' }));
    expect(dialog).toHaveTextContent(
      'From Fri 30 Oct, monthly on the 30th. Payments already made stay as they were.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Change date' }));

    expect(
      await screen.findByText('Car loan now goes out monthly on the 30th, from Fri 30 Oct')
    ).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0]).toEqual({
      id: 'loan',
      input: { firstPaymentDate: '2026-10-30' }
    });
  });

  it('changes a one-off’s date and offers nothing for one already paid', async () => {
    const { user, api } = renderDashboard();

    await fromMenu(user, { payment: 'Birthday', item: 'Change date' });
    const dialog = await screen.findByRole('dialog', { name: 'Change date' });
    expect(dialog).toHaveTextContent('Changes the date of this one-off payment.');
    await user.click(within(dialog).getByRole('button', { name: 'New date' }));
    await user.click(await screen.findByRole('button', { name: 'Friday, 9 October 2026' }));
    await user.click(within(dialog).getByRole('button', { name: 'Change date' }));

    expect(await screen.findByText('Birthday moved to Fri 9 Oct')).toBeInTheDocument();
    expect(api.callsTo('UpdateOneOffPayment')[0]).toEqual({
      id: 'birthday',
      input: { dueDate: '2026-10-09' }
    });

    await user.click(screen.getByRole('radio', { name: /One-off/ }));
    await user.click(await screen.findByRole('button', { name: 'More actions for Dentist' }));
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Change amount' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Change date' })).not.toBeInTheDocument();
  });
});

describe('a payment opened from its row on desktop', () => {
  it('shows the same quick view as mobile, which quick edits go back to', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Car loan' }));
    const view = await screen.findByRole('dialog', { name: 'Car loan' });
    expect(view).toHaveTextContent('£245.00 · Mon 26 Oct');
    expect(within(view).getByRole('button', { name: 'Edit payment' })).toBeInTheDocument();
    await user.click(within(view).getByRole('button', { name: 'Change date' }));

    const dialog = await screen.findByRole('dialog', { name: 'Change date' });
    await user.click(within(dialog).getByRole('button', { name: 'Back to Car loan' }));
    expect(await screen.findByRole('dialog', { name: 'Car loan' })).toBeInTheDocument();
  });
});

describe('quick edits on mobile', () => {
  beforeEach(() => setViewportWidth(390));

  it('opens from the payment’s sheet and goes back to it', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Cleaner' }));
    const sheet = await screen.findByRole('dialog', { name: 'Cleaner' });
    await user.click(within(sheet).getByRole('button', { name: 'Change amount' }));

    const dialog = await screen.findByRole('dialog', { name: 'Change amount' });
    await user.click(within(dialog).getByRole('button', { name: 'Back to Cleaner' }));
    expect(await screen.findByRole('dialog', { name: 'Cleaner' })).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('dialog', { name: 'Cleaner' })).getByRole('button', {
        name: 'Change date'
      })
    );
    expect(await screen.findByRole('dialog', { name: 'Change date' })).toBeInTheDocument();
  });
});
