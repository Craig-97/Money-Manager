import { describe, expect, it } from 'vitest';
import { Payment } from './payments';
import { nextSort, PaymentSort, pickSort, sortLabel, sortPayments } from './sort';

const payment = (name: string, amount: number, due: string | null): Payment => ({
  kind: 'oneOff',
  id: name,
  name,
  amount,
  signedAmount: -amount,
  type: 'EXPENSE',
  category: 'OTHER',
  dueDate: due ? new Date(`${due}T00:00:00`) : null
});

const list = [
  payment('gym', 34, '2026-10-12'),
  payment('Energy', 120, '2026-10-14'),
  payment('Car loan', 245, null),
  payment('Netflix', 20, '2026-10-02')
];
const names = (payments: Payment[]) => payments.map(p => p.name);

describe('sortPayments', () => {
  it('sorts by date either way, with ended payments last', () => {
    expect(names(sortPayments(list, { key: 'date', ascending: true }))).toEqual([
      'Netflix',
      'gym',
      'Energy',
      'Car loan'
    ]);
    expect(names(sortPayments(list, { key: 'date', ascending: false }))).toEqual([
      'Energy',
      'gym',
      'Netflix',
      'Car loan'
    ]);
  });

  it('sorts by amount and by name, ignoring case', () => {
    expect(names(sortPayments(list, { key: 'amount', ascending: false }))).toEqual([
      'Car loan',
      'Energy',
      'gym',
      'Netflix'
    ]);
    expect(names(sortPayments(list, { key: 'name', ascending: true }))).toEqual([
      'Car loan',
      'Energy',
      'gym',
      'Netflix'
    ]);
  });
});

describe('choosing a sort', () => {
  it('turns the current one round, and starts another from its own direction', () => {
    expect(pickSort({ key: 'date', ascending: true }, 'date')).toEqual({
      key: 'date',
      ascending: false
    });
    expect(pickSort({ key: 'date', ascending: true }, 'amount')).toEqual({
      key: 'amount',
      ascending: false
    });
    expect(pickSort({ key: 'amount', ascending: false }, 'name')).toEqual({
      key: 'name',
      ascending: true
    });
  });

  it('steps the mobile button through date, amount and name', () => {
    const steps: PaymentSort[] = [{ key: 'date', ascending: true }];
    for (let i = 0; i < 4; i++) steps.push(nextSort(steps.at(-1)!));
    expect(steps.map(sortLabel)).toEqual(['Date ↑', 'Date ↓', 'Amount ↓', 'Name A–Z', 'Date ↑']);
  });
});
