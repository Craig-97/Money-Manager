import { Bill } from './bill';
import { Note } from './note';
import { OneOffPayment } from './oneOffPayment';
import { Payday } from './payday';
import { User } from './user';

export interface AccountState {
  id?: string;
  bankBalance: number;
  monthlyIncome: number;
  bankPaydayBalance?: number;
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
