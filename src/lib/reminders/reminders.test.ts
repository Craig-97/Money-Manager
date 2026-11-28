import { describe, expect, it } from 'vitest';
import { Note } from '../notes';
import { DEFAULT_REMINDER_SETTINGS, OneOffPayment, RecurringPayment } from '../payments';
import {
  canClear,
  filterReminders,
  firedText,
  inTime,
  kindText,
  laterUntil,
  newReminders,
  overdueKey,
  rateEndKey,
  Reminder,
  ReminderSources,
  ReminderState,
  upcomingReminders
} from './reminders';
import { recurringPayment } from '~/test/builders';
import { day, TODAY } from '~/test/dates';

const CYCLE = {
  start: day('2026-09-25'),
  end: day('2026-10-30'),
  endUsual: day('2026-10-30'),
  isPayday: false
};

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
    const energy = recurringPayment({ id: 'Energy', dueDate: day('2026-10-03') });
    const later = recurringPayment({ id: 'Gym', dueDate: day('2026-10-09') });

    const fresh = newReminders(sources({ payments: [energy, later], payday: undefined } as never));

    expect(titles(fresh)).toContain('Energy is due tomorrow');
    expect(titles(fresh)).not.toContain('Gym is due in 7 days');
  });

  it('puts overdue payments first, and they can only be put away, not cleared', () => {
    const spotify = recurringPayment({ id: 'Spotify', dueDate: day('2026-10-01') });
    const energy = recurringPayment({ id: 'Energy', dueDate: day('2026-10-03') });

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
    const tax = recurringPayment({
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
    const energy = recurringPayment({ id: 'Energy', dueDate: day('2026-10-03') });
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
    const energy = recurringPayment({
      id: 'Energy',
      dueDate: day('2026-10-03'),
      dueReminderDays: null
    });

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

describe('rate ends', () => {
  // A mortgage whose fixed rate ends on Thursday 31 December, 90 days from today
  const mortgage = (rateEndsOn: string, overrides: Partial<RecurringPayment> = {}) =>
    recurringPayment({
      id: 'Mortgage',
      amount: 750,
      dueDate: day('2026-10-28'),
      debt: {
        balance: 148200,
        startingBalance: 165000,
        apr: 4.29,
        balanceUpdatedAt: null,
        paidOffThisCycle: 0,
        accrued: 0,
        accruedTo: null,
        rateEndsOn: day(rateEndsOn)
      },
      ...overrides
    });
  const rateEnds = (list: Reminder[]) =>
    list.filter(reminder => reminder.kind === 'rateEnds' || reminder.kind === 'rateEnded');
  const fresh = (payment: RecurringPayment) =>
    rateEnds(newReminders(sources({ payments: [payment] })));
  const ahead = (payment: RecurringPayment) =>
    rateEnds(upcomingReminders(sources({ payments: [payment] })));

  it('goes off 3 months before unless the debt’s reminder says otherwise', () => {
    const payment = mortgage('2026-12-31');

    const [reminder] = fresh(payment);

    expect(reminder).toMatchObject({
      key: 'rateends:Mortgage:2026-12-31',
      kind: 'rateEnds',
      title: 'Mortgage rate ends on Thu 31 Dec',
      name: 'Mortgage rate ends',
      body: 'Check your new rate and payment',
      timing: '3 months before',
      firesOn: day('2026-10-02')
    });
    expect(
      rateEndKey(payment, { date: day('2026-12-31'), days: 90, soon: true, passed: false })
    ).toBe(reminder.key);
    expect(kindText(reminder)).toBe('Rate ends');
    // Not yet, a day further off
    expect(fresh(mortgage('2027-01-01'))).toHaveLength(0);

    const month = mortgage('2026-12-31', { renewalReminder: { off: false, days: 30 } });
    expect(fresh(month)).toHaveLength(0);
    expect(ahead(month)[0]).toMatchObject({
      timing: '1 month before',
      firesOn: day('2026-12-01')
    });
  });

  it('is coming up while it is ahead, even with its reminder off', () => {
    const off = mortgage('2027-03-01', { renewalReminder: { off: true, days: null } });

    expect(ahead(off)[0]).toMatchObject({
      name: 'Mortgage rate ends',
      timing: 'Off',
      firesOn: null
    });
    expect(fresh(off)).toHaveLength(0);
  });

  it('stays in New once it has gone by, but is no longer ahead', () => {
    const payment = mortgage('2026-09-28');

    expect(fresh(payment)).toHaveLength(1);
    expect(fresh(payment)[0]).toMatchObject({
      key: 'rateended:Mortgage:2026-09-28',
      kind: 'rateEnded',
      title: 'Mortgage rate has ended',
      timing: 'Ended'
    });
    expect(ahead(payment)).toHaveLength(0);
  });

  it('goes away when cleared or put away, as a renewal does', () => {
    const payment = mortgage('2026-12-31');
    const key = 'rateends:Mortgage:2026-12-31';

    const cleared = sources({
      payments: [payment],
      states: new Map([[key, state({ cleared: true })]])
    });
    const later = sources({
      payments: [payment],
      states: new Map([[key, state({ snoozedUntil: day('2026-10-05') })]])
    });

    expect(rateEnds(newReminders(cleared))).toHaveLength(0);
    expect(rateEnds(newReminders(later))).toHaveLength(0);
    expect(rateEnds(newReminders({ ...later, today: day('2026-10-05') }))).toHaveLength(1);
  });

  it('is put away for three days with Later, and filtered with the renewals', () => {
    const [reminder] = fresh(mortgage('2026-12-31'));

    expect(laterUntil(reminder, TODAY)).toEqual(day('2026-10-05'));
    expect(filterReminders([reminder], 'renewals')).toHaveLength(1);
    expect(filterReminders([reminder], 'payments')).toHaveLength(0);
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
    iconUrl: null,
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
          recurringPayment({ id: 'Energy', dueDate: day('2026-10-09') }),
          recurringPayment({
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
    const insurance = recurringPayment({
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
      sources({ payments: [recurringPayment({ id: 'Energy' })], notes: [note({ id: 'mot' })] })
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
    interest: {
      rate: 4.5,
      frequency: null,
      day: null,
      nextDate: null,
      accrued: 0,
      accruedTo: null,
      added: []
    },
    purpose: null,
    iconUrl: null,
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

describe('savings interest', () => {
  type Added = { date: Date; amount: number; balanceAfter: number }[];
  const easy = (next: string, added: Added = []) => ({
    id: 'easy',
    name: 'Easy access',
    kind: 'SAVINGS' as const,
    balance: 4200,
    counts: true,
    paidInto: false,
    interest: {
      rate: 4.1,
      frequency: 'MONTHLY' as const,
      day: 1,
      nextDate: day(next),
      accrued: 0,
      accruedTo: null,
      added
    },
    purpose: null,
    iconUrl: null,
    balanceUpdatedAt: TODAY
  });

  it('says what the app added, to check against the bank, putting it away for a few days', () => {
    const added = [{ date: day('2026-10-01'), amount: 11.45, balanceAfter: 4211.45 }];
    const reminder = newReminders(sources({ accounts: [easy('2026-11-01', added)] })).find(
      item => item.kind === 'interestAdded'
    )!;
    expect(reminder).toMatchObject({
      key: 'interest-added:easy:2026-10-01',
      title: '£11.45 interest added to Easy access',
      body: 'Thu 1 Oct · balance now £4,211.45 · check it against your bank'
    });
    expect(kindText(reminder)).toBe('Interest');
    expect(canClear(reminder)).toBe(true);
    expect(laterUntil(reminder, TODAY)).toEqual(day('2026-10-05'));
  });

  it('makes several payments added while away one reminder', () => {
    const added = [
      { date: day('2026-08-01'), amount: 11, balanceAfter: 4111 },
      { date: day('2026-09-01'), amount: 11.1, balanceAfter: 4122.1 },
      { date: day('2026-10-01'), amount: 11.09, balanceAfter: 4133.19 }
    ];
    const reminders = newReminders(sources({ accounts: [easy('2026-11-01', added)] })).filter(
      item => item.kind === 'interestAdded'
    );
    expect(reminders.map(item => item.title)).toEqual([
      '£33.19 interest added to Easy access over 3 months'
    ]);
  });

  it('shows the next payment in Coming up, never in New: it’s added on the day', () => {
    const ahead = sources({ accounts: [easy('2026-11-01')] });
    expect(newReminders(ahead).map(item => item.kind)).not.toContain('interest');
    expect(upcomingReminders(ahead).find(item => item.kind === 'interest')).toMatchObject({
      name: 'Easy access interest',
      body: 'About £14.09 · added on Sun 1 Nov'
    });
    const today = sources({ accounts: [easy('2026-10-02')] });
    expect(newReminders(today).map(item => item.kind)).not.toContain('interest');
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
