export interface Bill {
  id?: string;
  name?: string;
  amount?: number;
  paid?: boolean;
  account?: string;
}

export interface Account {
  id?: string;
  bankBalance: number;
  monthlyIncome: number;
  bankPaydayTotal?: number;
  bills: Array<Bill>;
  paymentsDue?: Array<any>;
  billsTotal?: number;
  paymentsDueTotal?: number;
  discIncome?: number;
  bankFreeToSpend?: number;
  payDayDiscIncome?: number;
  transactions?: Array<any>;
}

export interface AccountData {
  account: Account;
}
