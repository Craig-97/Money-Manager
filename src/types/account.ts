import { OneOffPayment } from './oneOffPayment';
import { Bill } from './bill';
import { Note } from './note';
import { User } from './user';
import { Payday } from './payday';

export interface AccountState {
  id?: string;
  bankBalance: number;
  monthlyIncome: number;
  bankPaydayTotal?: number;
  bills: Array<Bill>;
  paymentsDue?: Array<Bill | OneOffPayment>;
  billsTotal?: number;
  paymentsDueTotal?: number;
  discIncome?: number;
  bankFreeToSpend?: number;
  payDayDiscIncome?: number;
  notes?: Array<Note>;
  paydayConfig?: Payday | null;
}

export interface Account {
  id: string;
  bankBalance: number;
  monthlyIncome: number;
  bills: Array<Bill>;
  oneOffPayments: Array<OneOffPayment>;
  payday: Payday;
  notes: Array<Note>;
}

export interface AccountData {
  account: Account;
}

export interface AccountContextState {
  account: AccountState;
  user: User;
}
