import { describe, expect, it } from 'vitest';
import { RecurringPayment } from './payments';
import {
  addYear,
  Renewal,
  renewalNote,
  renewalOf,
  renewalTag,
  renewalWhen,
  renewalWindow
} from './renewal';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};

// Friday 2 October 2026
const TODAY = day('2026-10-02');

const payment = (overrides: Partial<RecurringPayment> = {}): RecurringPayment => ({
  kind: 'recurring',
  id: 'home',
  name: 'Home insurance',
  amount: 21,
  signedAmount: -21,
  type: 'EXPENSE',
  category: 'INSURANCE',
  frequency: 'MONTHLY',
  firstPaymentDate: day('2025-02-20'),
  lastPaymentDate: null,
  dueDate: day('2026-10-20'),
  handled: [],
  renewalDate: day('2027-02-02'),
  renewalReminderDays: 30,
  ...overrides
});

const renewal = (days: number, extra: Partial<Renewal> = {}): Renewal => ({
  date: day('2026-10-02'),
  days,
  soon: false,
  passed: false,
  ...extra
});

describe('renewalOf', () => {
  it('reads a renewal date, coming up once inside its reminder', () => {
    expect(renewalOf(payment(), TODAY)).toMatchObject({ days: 123, soon: false, passed: false });
    expect(renewalOf(payment({ renewalDate: day('2026-10-24') }), TODAY)).toMatchObject({
      days: 22,
      soon: true,
      passed: false
    });
  });

  it('never counts as coming up with the reminder off', () => {
    expect(
      renewalOf(payment({ renewalDate: day('2026-10-03'), renewalReminderDays: 0 }), TODAY)
    ).toMatchObject({ soon: false });
  });

  it('has gone by once the date passes without a new one', () => {
    expect(renewalOf(payment({ renewalDate: day('2026-09-28') }), TODAY)).toMatchObject({
      days: -4,
      passed: true,
      soon: false
    });
  });

  it('renews a yearly payment with each payment, whether or not it has a reminder', () => {
    const yearly = payment({
      frequency: 'ANNUALLY',
      renewalDate: null,
      dueDate: day('2026-10-24')
    });
    expect(renewalOf(yearly, TODAY)).toMatchObject({ date: day('2026-10-24'), soon: true });
    // The reminder only decides when it shows as coming up
    expect(renewalOf({ ...yearly, renewalReminderDays: 0 }, TODAY)).toMatchObject({
      date: day('2026-10-24'),
      soon: false
    });
  });

  it("doesn't renew a yearly payment that stops", () => {
    const stopping = payment({
      frequency: 'ANNUALLY',
      renewalDate: null,
      dueDate: day('2026-10-24'),
      lastPaymentDate: day('2027-10-24')
    });
    expect(renewalOf(stopping, TODAY)).toBeNull();
  });

  it('has none for a payment without a renewal or that has ended', () => {
    expect(renewalOf(payment({ renewalDate: null }), TODAY)).toBeNull();
    expect(renewalOf(payment({ dueDate: null }), TODAY)).toBeNull();
  });
});

describe('renewal labels', () => {
  it('says when it renews', () => {
    expect(renewalTag(renewal(22, { soon: true }), TODAY)).toBe('Renews in 22 days');
    expect(renewalTag(renewal(1, { soon: true }), TODAY)).toBe('Renews tomorrow');
    expect(renewalTag({ ...renewal(123), date: day('2027-02-02') }, TODAY)).toBe(
      'Renews 2 Feb 2027'
    );
    expect(renewalTag({ ...renewal(30), date: day('2026-11-01') }, TODAY)).toBe('Renews 1 Nov');
    expect(renewalTag(renewal(-4, { passed: true }), TODAY)).toBe('Needs renewing');
  });

  it('says how far off it is in days, weeks, months or years', () => {
    expect(renewalWhen(renewal(22))).toBe('22 days');
    expect(renewalWhen(renewal(123))).toBe('18 weeks');
    expect(renewalWhen(renewal(300))).toBe('10 months');
    expect(renewalWhen(renewal(800))).toBe('2 years');
  });

  it('notes a renewal by the category only while it needs a look', () => {
    expect(renewalNote(payment(), TODAY)).toBeNull();
    expect(renewalNote(payment({ renewalDate: day('2026-10-24') }), TODAY)).toBe(
      'Renews in 22 days'
    );
  });
});

describe('renewalWindow', () => {
  const item = (days: number, passed = false) => ({ renewal: renewal(days, { passed }) });

  it('uses the shortest window that holds the soonest three', () => {
    const items = [item(5), item(12), item(20), item(200)];
    expect(renewalWindow(items, TODAY)).toMatchObject({ label: 'Next month', count: 3 });
  });

  it('widens to fit renewals that are spread out', () => {
    expect(renewalWindow([item(40), item(150), item(170)], TODAY).label).toBe('Next 6 months');
    expect(renewalWindow([item(40), item(500)], TODAY).label).toBe('Next 2 years');
  });

  it('settles for a window holding the next one when the rest are further off', () => {
    const result = renewalWindow([item(10), item(900), item(1000)], TODAY);
    expect(result).toMatchObject({ label: 'Next month', count: 1 });
    expect(result.shown).toHaveLength(1);
  });

  it('puts ones that need renewing first, without letting them set the window', () => {
    const result = renewalWindow([item(100), item(-3, true)], TODAY);
    expect(result.shown.map(entry => entry.renewal.days)).toEqual([-3, 100]);
    expect(result).toMatchObject({ label: 'Next 6 months', count: 2 });
  });

  it('names the month when even the soonest is more than two years away', () => {
    const far = { renewal: { ...renewal(900), date: day('2029-03-21') } };
    expect(renewalWindow([far], TODAY)).toMatchObject({ label: 'Next in Mar 2029', count: 0 });
  });
});

describe('addYear', () => {
  it('moves 29 February to the 28th', () => {
    expect(addYear(day('2028-02-29'))).toEqual(day('2029-02-28'));
    expect(addYear(day('2026-10-02'))).toEqual(day('2027-10-02'));
  });
});
