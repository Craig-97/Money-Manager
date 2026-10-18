import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import {
  apiDate,
  createFakeApi,
  DEFAULT_ACCOUNT,
  FakeAccount,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026; paid on Wednesday 30 September, the last working day. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => vi.useRealTimers());

const monthly = (fields: Partial<FakeRecurringPayment> & { id: string; name: string }) => ({
  amount: 20,
  category: 'SUBSCRIPTION',
  frequency: 'MONTHLY',
  type: 'EXPENSE' as const,
  firstPaymentDate: apiDate('2026-01-01'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  history: [],
  renewalDate: null,
  ...fields
});

// Spotify went by unpaid yesterday, energy is due tomorrow, and the MOT is in three weeks
const account = (): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
  recurringPayments: [
    monthly({ id: 'spotify', name: 'Spotify', nextDueDate: apiDate('2026-10-01') }),
    monthly({
      id: 'energy',
      name: 'Energy',
      amount: 120,
      category: 'UTILITIES',
      firstPaymentDate: apiDate('2026-01-03'),
      nextDueDate: apiDate('2026-10-03')
    })
  ],
  notes: [
    {
      id: 'mot',
      body: 'Car MOT and service',
      color: 'BLUE',
      createdAt: String(Date.parse('2026-09-01T10:00:00Z')),
      updatedAt: String(Date.parse('2026-09-01T10:00:00Z')),
      date: apiDate('2026-10-22'),
      remind: [14],
      repeat: 'YEARLY',
      payment: null
    }
  ],
  // Started on payday, so payday's reminder says so
  cycleStartedOn: apiDate('2026-09-30')
});

const renderReminders = (route = '/reminders', data = account()) => {
  const api = createFakeApi({ account: data });
  return { ...renderApp({ route, api }), api };
};

const newList = () => screen.findByRole('region', { name: 'New reminders' });
const reminderTitles = (list: HTMLElement) =>
  within(list)
    .getAllByRole('heading', { level: 3 })
    .map(heading => heading.textContent);

describe('reminders page', () => {
  it('lists what has gone off, an overdue payment first, and counts it on the bell', async () => {
    renderReminders();

    const list = await newList();
    expect(reminderTitles(list)).toEqual([
      'Spotify · £20.00 was due Thu 1 Oct (new)',
      'Energy is due tomorrow (new)',
      'You were paid on Wed 30 Sep (new)'
    ]);
    expect(screen.getByRole('button', { name: 'Reminders, 3 new' })).toBeInTheDocument();
    // An overdue payment goes once it's paid or skipped, so it can't be cleared
    expect(within(list).queryByRole('button', { name: /^Clear: Spotify/ })).not.toBeInTheDocument();
  });

  it('clears a reminder on the account, with undo', async () => {
    const { user, api } = renderReminders();

    await user.click(
      within(await newList()).getByRole('button', { name: 'Clear: Energy is due tomorrow' })
    );

    expect(screen.queryByText('Energy is due tomorrow')).not.toBeInTheDocument();
    expect(api.callsTo('UpdateReminders')).toEqual([
      { input: { accountId: 'account-1', keys: ['due:energy:2026-10-03'], action: 'CLEAR' } }
    ]);
    await user.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(await screen.findByText('Energy is due tomorrow')).toBeInTheDocument();
    expect(api.callsTo('UpdateReminders')[1]).toMatchObject({ input: { action: 'RESTORE' } });
  });

  it('puts an overdue payment away until tomorrow with Later', async () => {
    const { user, api } = renderReminders();

    const spotify = within(await newList()).getByRole('article', {
      name: 'Spotify · £20.00 was due Thu 1 Oct'
    });
    await user.click(within(spotify).getByRole('button', { name: 'Later' }));

    expect(await screen.findByText('It’ll be back tomorrow')).toBeInTheDocument();
    expect(api.callsTo('UpdateReminders')).toEqual([
      {
        input: {
          accountId: 'account-1',
          keys: ['overdue:spotify:2026-10-01'],
          action: 'LATER',
          until: '2026-10-03'
        }
      }
    ]);
  });

  it('marks everything read, so the bell has nothing to count', async () => {
    const { user, api } = renderReminders();
    await newList();

    await user.click(screen.getByRole('button', { name: 'Mark all read' }));

    expect(await screen.findByRole('button', { name: 'Reminders' })).toBeInTheDocument();
    expect(api.callsTo('UpdateReminders')[0]).toMatchObject({
      input: { action: 'READ', keys: expect.arrayContaining(['due:energy:2026-10-03']) }
    });
  });

  it('shows what’s coming up by month, and changes when one payment reminds', async () => {
    const { user, api } = renderReminders('/reminders?tab=up');

    const upcoming = await screen.findByRole('region', { name: 'Coming up' });
    expect(within(upcoming).getByRole('heading', { name: 'October' })).toBeInTheDocument();
    expect(within(upcoming).getByText('Car MOT and service')).toBeInTheDocument();

    await user.click(
      within(upcoming).getByRole('button', { name: 'More actions for Energy is due' })
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Change when' }));
    const dialog = await screen.findByRole('dialog', { name: 'Remind me about Energy' });
    await user.click(within(dialog).getByRole('radio', { name: '3 days before' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(api.callsTo('UpdateRecurringPayment')).toEqual([
        { id: 'energy', input: { dueReminder: { off: false, days: 3 } } }
      ])
    );
  });

  it('only shows notes when filtered to them', async () => {
    const { user } = renderReminders('/reminders?tab=up');
    const upcoming = await screen.findByRole('region', { name: 'Coming up' });

    await user.click(screen.getByRole('radio', { name: 'Notes' }));

    expect(within(upcoming).getAllByRole('listitem')).toHaveLength(1);
    expect(within(upcoming).getByText('Car MOT and service')).toBeInTheDocument();
  });

  it('changes the usual timing straight away', async () => {
    const { user, api } = renderReminders();
    const timing = await screen.findByRole('region', { name: 'Usual timing' });

    await user.click(within(timing).getByRole('radio', { name: '3 days before' }));

    expect(within(timing).getByRole('radio', { name: '3 days before' })).toBeChecked();
    expect(api.callsTo('UpdateReminderSettings')).toEqual([
      { input: { accountId: 'account-1', paymentDays: 3 } }
    ]);
  });
});

describe('the bell', () => {
  it('opens what’s new from any page, and goes to the rest', async () => {
    const { user } = renderReminders('/dashboard');

    await user.click(await screen.findByRole('button', { name: 'Reminders, 3 new' }));
    const panel = await screen.findByRole('dialog', { name: 'Reminders' });
    expect(within(panel).getByText('Energy is due tomorrow')).toBeInTheDocument();

    await user.click(within(panel).getByRole('link', { name: 'See all reminders' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Reminders' })).toBeInTheDocument();
  });
});

describe('reminders on mobile', () => {
  beforeEach(() => setViewportWidth(390));

  it('opens a reminder to see it and pay it', async () => {
    const { user, api } = renderReminders();

    // Named by its title and when it went off
    await user.click(await screen.findByRole('button', { name: /^Energy is due tomorrow/ }));
    await user.click(screen.getByRole('button', { name: 'Mark as paid' }));

    await vi.waitFor(() => expect(api.callsTo('MarkPaymentsPaid')).toHaveLength(1));
  });

  it('keeps the usual timing in a sheet from the header', async () => {
    const { user } = renderReminders();

    await user.click(await screen.findByRole('button', { name: 'Reminder settings' }));

    const sheet = await screen.findByRole('dialog', { name: 'Reminder settings' });
    expect(within(sheet).getByRole('radio', { name: '1 day before' })).toBeChecked();
  });

  it('asks what to add, from the nav', async () => {
    const { user } = renderReminders();
    await screen.findByRole('list', { name: 'New reminders' });

    await user.click(screen.getByRole('button', { name: 'Add a reminder' }));
    await user.click(await screen.findByRole('button', { name: /^Note with a date/ }));

    expect(await screen.findByRole('dialog', { name: 'New note' })).toBeInTheDocument();
  });
});
