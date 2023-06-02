import { OneOffPayment } from './oneOffPayment';
import { Bill } from './bill';
import { Note } from './note';
import { User } from './user';

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
}

export interface Account {
  id: string;
  bankBalance: number;
  monthlyIncome: number;
  bills: Array<Bill>;
  oneOffPayments: Array<OneOffPayment>;
  notes: Array<Note>;
}

export interface AccountData {
  account: Account;
}

export interface AccountContextState {
  account: AccountState;
  user: User;
}
