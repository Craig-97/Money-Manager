import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
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

// Friday 2 October 2026. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => {
  vi.useRealTimers();
  resetViewport();
});

// Every Wednesday, so four times before payday
const cleaner: FakeRecurringPayment = {
  id: 'cleaner',
  name: 'Cleaner',
  amount: 50,
  category: 'BILLS',
  frequency: 'WEEKLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-07'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null
};

const budget = (): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  // Started today, so the payday prompt stays away
  cycleStartedOn: apiDateFromToday(0),
  recurringPayments: [...structuredClone(DEFAULT_BUDGET.recurringPayments), cleaner],
  notes: [
    ...structuredClone(DEFAULT_BUDGET.notes),
    {
      id: 'note-mortgage',
      body: 'Fixed rate ends in March',
      color: 'AMBER',
      createdAt: apiDate('2026-09-01'),
      updatedAt: apiDate('2026-09-01'),
      payment: 'recurring-1'
    }
  ]
});

const renderDashboard = () => {
  const api = createFakeApi({ budget: budget() });
  return { ...renderApp({ route: '/dashboard', api }), api };
};

describe('notes on a payment, on desktop', () => {
  it('shows a note chip by the payment and lists its notes when clicked', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: '1 note on Mortgage' }));

    const dialog = await screen.findByRole('dialog', { name: 'Notes on Mortgage' });
    expect(within(dialog).getByText('Fixed rate ends in March')).toBeInTheDocument();
    expect(within(dialog).getByText('£750.00 a month')).toBeInTheDocument();
    // Only payments with notes have a chip
    expect(screen.queryByRole('button', { name: /notes? on Cleaner/ })).not.toBeInTheDocument();
  });

  it('opens a note to change it and comes back to the list', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: '1 note on Mortgage' }));
    const list = await screen.findByRole('dialog', { name: 'Notes on Mortgage' });
    await user.click(
      within(list).getByRole('button', { name: 'Edit note: Fixed rate ends in March' })
    );

    const note = await screen.findByRole('dialog', { name: 'Edit note' });
    await user.click(within(note).getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('dialog', { name: 'Notes on Mortgage' })).toBeInTheDocument();
  });

  it('adds a note already linked to the payment, then lists it', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: '1 note on Mortgage' }));
    const list = await screen.findByRole('dialog', { name: 'Notes on Mortgage' });
    await user.click(within(list).getByRole('button', { name: 'Add a note' }));

    const note = await screen.findByRole('dialog', { name: 'New note' });
    expect(within(note).getByRole('combobox', { name: 'Payment' })).toHaveTextContent(
      'Mortgage · £750.00 a month'
    );
    await user.type(within(note).getByLabelText('Note'), 'Ask about overpaying');
    await user.click(within(note).getByRole('button', { name: 'Save note' }));

    const back = await screen.findByRole('dialog', { name: 'Notes on Mortgage' });
    expect(await within(back).findByText('Ask about overpaying')).toBeInTheDocument();
    expect(api.callsTo('CreateNote')[0]).toMatchObject({
      input: expect.objectContaining({ payment: 'recurring-1' })
    });
  });

  it('offers Notes in the menu, or Add a note when there are none', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'More actions for Mortgage' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Notes (1)' }));
    expect(await screen.findByRole('dialog', { name: 'Notes on Mortgage' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(await screen.findByRole('button', { name: 'More actions for Cleaner' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Add a note' }));
    const note = await screen.findByRole('dialog', { name: 'New note' });
    expect(within(note).getByRole('combobox', { name: 'Payment' })).toHaveTextContent(
      'Cleaner · £50.00 a week'
    );
  });
});

describe('a payment on mobile', () => {
  beforeEach(() => setViewportWidth(390));

  it('opens a sheet with its dates before payday, its notes and what to do', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Cleaner' }));
    const sheet = await screen.findByRole('dialog', { name: 'Cleaner' });

    expect(within(sheet).getByText('Due 4 times before payday')).toBeInTheDocument();
    expect(
      within(sheet).getByRole('button', { name: 'Mark as paid, ticks off Wed 7 Oct' })
    ).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Add a note' })).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Edit payment' })).toBeInTheDocument();
  });

  it('shows the first note, which lists them all with a way back to the payment', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Mortgage, 1 note' }));
    const sheet = await screen.findByRole('dialog', { name: 'Mortgage' });
    await user.click(within(sheet).getByRole('button', { name: '1 note on Mortgage' }));

    const list = await screen.findByRole('dialog', { name: 'Notes on Mortgage' });
    await user.click(within(list).getByRole('button', { name: 'Back to Mortgage' }));
    expect(await screen.findByRole('dialog', { name: 'Mortgage' })).toBeInTheDocument();
  });

  it('marks it paid from the sheet', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Mortgage, 1 note' }));
    const sheet = await screen.findByRole('dialog', { name: 'Mortgage' });
    await user.click(within(sheet).getByRole('button', { name: 'Mark as paid' }));

    expect(await screen.findByText(/Mortgage marked as paid/)).toBeInTheDocument();
    expect(api.callsTo('MarkPaymentsPaid')).toHaveLength(1);
  });
});
