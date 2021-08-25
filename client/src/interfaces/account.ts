export interface Account {
  id?: string;
  bankBalance?: number;
  monthlyIncome?: number;
  bankPaydayTotal?: number;
  bills?: Array<any>;
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
