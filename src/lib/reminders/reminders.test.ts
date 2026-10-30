import { describe, expect, it } from 'vitest';
import { Note } from '~/lib/notes';
import { DEFAULT_REMINDER_SETTINGS, OneOffPayment, RecurringPayment } from '~/lib/payments';
import {
  canClear,
  filterReminders,
  firedText,
  inTime,
  kindText,
  laterUntil,
  newReminders,
  overdueKey,
  ReminderSources,
  ReminderState,
  upcomingReminders
} from './reminders';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};

// Friday 2 October 2026; paid on Friday 25 September, next on Friday 30 October
const TODAY = day('2026-10-02');
const CYCLE = {
  start: day('2026-09-25'),
  end: day('2026-10-30'),
  endUsual: day('2026-10-30'),
  isPayday: false
};

const payment = (overrides: Partial<RecurringPayment> & { id: string }): RecurringPayment => ({
  kind: 'recurring',
  account: null,
  into: null,
  paysInto: null,
  name: overrides.id,
  amount: 20,
  signedAmount: -20,
  type: 'EXPENSE',
  category: 'SUBSCRIPTIONS',
  frequency: 'MONTHLY',
  firstPaymentDate: day('2026-01-09'),
  lastPaymentDate: null,
  dueDate: day('2026-10-09'),
  thisCycle: [],
  renewalDate: null,
  dueReminder: { off: false, days: null },
  renewalReminder: { off: false, days: null },
  dueReminderDays: 1,
  renewalReminderDays: 30,
  debt: null,
  ...overrides
});

const note = (overrides: Partial<Note> & { id: string }): Note => ({
  body: 'Car MOT and service',
  color: 'BLUE',
  created: 0,
  updated: 0,
  date: day('2026-10-22'),
  remind: [14],
  repeat: 'NONE',
  paymentId: null,
  ...overrides
});

const sources = (overrides: Partial<ReminderSources> = {}): ReminderSources => ({
  payments: [],
  notes: [],
  settings: DEFAULT_REMINDER_SETTINGS,
  cycle: CYCLE,
  cycleStartedOn: day('2026-09-25'),
  payAmount: 3600,
  states: new Map(),
  today: TODAY,
  ...overrides
});

const state = (fields: Partial<ReminderState>): ReminderState => ({
  read: false,
  cleared: false,
  snoozedUntil: null,
  ...fields
});

const titles = (list: { title: string }[]) => list.map(item => item.title);

describe('new reminders', () => {
  it('goes off the usual day before a payment, and not before', () => {
    const energy = payment({ id: 'Energy', dueDate: day('2026-10-03') });
    const later = payment({ id: 'Gym', dueDate: day('2026-10-09') });

    const fresh = newReminders(sources({ payments: [energy, later], payday: undefined } as never));

    expect(titles(fresh)).toContain('Energy is due tomorrow');
    expect(titles(fresh)).not.toContain('Gym is due in 7 days');
  });

  it('puts overdue payments first, and they can only be put away, not cleared', () => {
    const spotify = payment({ id: 'Spotify', dueDate: day('2026-10-01') });
    const energy = payment({ id: 'Energy', dueDate: day('2026-10-03') });

    const [first] = newReminders(sources({ payments: [energy, spotify] }));

    expect(first).toMatchObject({
      kind: 'overdue',
      key: overdueKey(spotify, day('2026-10-01')),
      title: 'Spotify · £20.00 was due Thu 1 Oct'
    });
    expect(canClear(first)).toBe(false);
    expect(firedText(first, TODAY)).toBe('Overdue');
  });

  it('words a renewal as the dashboard alert does', () => {
    const tax = payment({
      id: 'Car tax',
      firstPaymentDate: day('2026-01-16'),
      dueDate: day('2026-10-16'),
      renewalDate: day('2026-10-16')
    });

    expect(titles(newReminders(sources({ payments: [tax] })))).toContain(
      'Car tax renews in 14 days'
    );
  });

  it('leaves out ones cleared or put away, until the day they come back', () => {
    const energy = payment({ id: 'Energy', dueDate: day('2026-10-03') });
    const key = 'due:Energy:2026-10-03';

    expect(
      newReminders(
        sources({ payments: [energy], states: new Map([[key, state({ cleared: true })]]) })
      )
    ).toEqual(expect.not.arrayContaining([expect.objectContaining({ key })]));
    const away = new Map([[key, state({ snoozedUntil: day('2026-10-03') })]]);
    expect(titles(newReminders(sources({ payments: [energy], states: away })))).not.toContain(
      'Energy is due tomorrow'
    );
    expect(
      titles(newReminders(sources({ payments: [energy], states: away, today: day('2026-10-03') })))
    ).toContain('Energy is due today');
  });

  it("doesn't remind about a payment whose reminder is off", () => {
    const energy = payment({ id: 'Energy', dueDate: day('2026-10-03'), dueReminderDays: null });

    expect(newReminders(sources({ payments: [energy] }))).toEqual(
      expect.not.arrayContaining([expect.objectContaining({ kind: 'due' })])
    );
  });

  it('goes off for a note at its latest reminder, each one a reminder of its own', () => {
    const mot = note({ id: 'mot', remind: [30, 7] });

    const [atMonth] = newReminders(sources({ notes: [mot] })).filter(r => r.kind === 'note');
    expect(atMonth).toMatchObject({
      key: 'note:mot:2026-10-22:30',
      title: 'Car MOT and service · in 20 days'
    });

    const [atWeek] = newReminders(sources({ notes: [mot], today: day('2026-10-16') })).filter(
      r => r.kind === 'note'
    );
    expect(atWeek.key).toBe('note:mot:2026-10-22:7');
  });

  it('says when payday went by, and that the cycle is waiting to be started', () => {
    const [payday] = newReminders(sources({ cycleStartedOn: day('2026-08-28') })).filter(
      r => r.kind === 'payday'
    );

    expect(payday).toMatchObject({ title: 'You were paid on Fri 25 Sep', awaitingStart: true });
    expect(
      newReminders(sources({ settings: { ...DEFAULT_REMINDER_SETTINGS, payday: false } }))
    ).toEqual([]);
  });

  it('puts payments away until tomorrow with Later, the rest for a few days', () => {
    expect(laterUntil({ kind: 'overdue' }, TODAY)).toEqual(day('2026-10-03'));
    expect(laterUntil({ kind: 'renewal' }, TODAY)).toEqual(day('2026-10-05'));
  });
});

describe('one-off payments', () => {
  const oneOff = (overrides: Partial<OneOffPayment> & { id: string }): OneOffPayment => ({
    kind: 'oneOff',
    name: overrides.id,
    amount: 75,
    signedAmount: -75,
    type: 'EXPENSE',
    category: 'GIFTS',
    dueDate: day('2026-10-03'),
    paidAt: null,
    dueReminder: { off: false, days: null },
    dueReminderDays: 1,
    account: null,
    ...overrides
  });

  it('reminds before one is due, and goes overdue until it is paid', () => {
    const birthday = oneOff({ id: 'Birthday' });
    const late = oneOff({ id: 'Parking', dueDate: day('2026-09-30') });
    const paid = oneOff({ id: 'Paid', dueDate: day('2026-09-30'), paidAt: day('2026-09-30') });

    const fresh = newReminders(sources({ payments: [birthday, late, paid] }));

    expect(titles(fresh)).toEqual(
      expect.arrayContaining(['Parking · £75.00 was due Wed 30 Sep', 'Birthday is due tomorrow'])
    );
    expect(titles(fresh).join()).not.toContain('Paid');
    expect(fresh.find(r => r.kind === 'overdue')?.body).toBe(
      'Still unpaid. Mark it paid or delete it to clear it.'
    );
    expect(kindText(upcomingReminders(sources({ payments: [birthday] }))[0])).toBe(
      'One-off payment'
    );
  });
});

describe('coming up', () => {
  it('lists each payment’s next date, renewals, notes and payday, soonest first', () => {
    const list = upcomingReminders(
      sources({
        payments: [
          payment({ id: 'Energy', dueDate: day('2026-10-09') }),
          payment({
            id: 'Phone',
            renewalDate: day('2027-01-19'),
            firstPaymentDate: day('2026-01-19'),
            dueDate: day('2026-10-19')
          })
        ],
        notes: [note({ id: 'mot' })]
      })
    );

    expect(list.map(item => item.name)).toEqual([
      'Energy is due',
      'Phone is due',
      'Car MOT and service',
      'Payday',
      'Phone renews'
    ]);
    expect(list.map(item => item.timing)).toEqual([
      '1 day before',
      '1 day before',
      '2 weeks before',
      'On the day',
      '1 month before'
    ]);
    expect(kindText(list[4])).toBe('Renewal');
  });

  it('shows a yearly payment once, as its renewal', () => {
    const insurance = payment({
      id: 'Car insurance',
      frequency: 'ANNUALLY',
      firstPaymentDate: day('2025-11-07'),
      dueDate: day('2026-11-07')
    });

    const list = upcomingReminders(sources({ payments: [insurance] }));

    expect(list.filter(item => item.payment).map(item => item.name)).toEqual([
      'Car insurance renews'
    ]);
  });

  it('filters to payments, renewals or notes', () => {
    const list = upcomingReminders(
      sources({ payments: [payment({ id: 'Energy' })], notes: [note({ id: 'mot' })] })
    );

    expect(filterReminders(list, 'notes').map(item => item.kind)).toEqual(['note']);
    expect(filterReminders(list, 'payments').map(item => item.kind)).toEqual(['due', 'payday']);
  });
});

describe('old balances', () => {
  const isa = (updated: string) => ({
    id: 'isa',
    name: 'Cash ISA',
    kind: 'SAVINGS' as const,
    balance: 8650,
    counts: false,
    paidInto: false,
    interestRate: 4.5,
    purpose: null,
    balanceUpdatedAt: day(updated)
  });

  it('reminds once a balance is four weeks old, until it is updated', () => {
    // Set on 28 August: five weeks ago
    const reminder = newReminders(sources({ accounts: [isa('2026-08-28')] })).find(
      item => item.kind === 'balance'
    )!;
    expect(reminder).toMatchObject({
      kind: 'balance',
      key: 'balance:isa:2026-08-28',
      title: 'Cash ISA balance is 5 weeks old',
      body: 'Your Accounts total may be out of date.'
    });
    expect(kindText(reminder)).toBe('Balance');
    expect(canClear(reminder)).toBe(true);
    expect(laterUntil(reminder, TODAY)).toEqual(day('2026-10-05'));

    // Updated a week ago: nothing yet, and nothing in Coming up either
    const kinds = (reminders: { kind: string }[]) => reminders.map(item => item.kind);
    expect(kinds(newReminders(sources({ accounts: [isa('2026-09-25')] })))).not.toContain(
      'balance'
    );
    expect(kinds(upcomingReminders(sources({ accounts: [isa('2026-09-25')] })))).not.toContain(
      'balance'
    );
  });
});

describe('inTime', () => {
  it('counts days for the next two months, as the renewal alerts do', () => {
    expect(inTime(0)).toBe('today');
    expect(inTime(1)).toBe('tomorrow');
    expect(inTime(14)).toBe('in 14 days');
    expect(inTime(59)).toBe('in 59 days');
    expect(inTime(120)).toBe('in 17 weeks');
    expect(inTime(250)).toBe('in 8 months');
  });
});
