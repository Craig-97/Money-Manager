/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type BankHolidayRegion = 'ENGLAND_AND_WALES' | 'NORTHERN_IRELAND' | 'SCOTLAND';

export type BillInput = {
  account?: string | number | null | undefined;
  amount?: number | null | undefined;
  name?: string | null | undefined;
  paid?: boolean | null | undefined;
};

export type CreateAccountInput = {
  bankBalance: number;
  bills?: Array<BillInput | null | undefined> | null | undefined;
  monthlyIncome: number;
  oneOffPayments?: Array<OneOffPaymentInput | null | undefined> | null | undefined;
  payday?: PaydayInput | null | undefined;
  recurringPayments?: Array<RecurringPaymentInput | null | undefined> | null | undefined;
  userId: string | number;
};

export type EditAccountInput = {
  bankBalance?: number | null | undefined;
  monthlyIncome?: number | null | undefined;
};

export type NoteInput = {
  account?: string | number | null | undefined;
  body?: string | null | undefined;
};

export type OneOffPaymentCategory =
  | 'BUSINESS'
  | 'CHARITY'
  | 'EDUCATION'
  | 'ENTERTAINMENT'
  | 'FEES'
  | 'FOOD'
  | 'GIFT'
  | 'HEALTHCARE'
  | 'HOME'
  | 'INVESTMENT'
  | 'OTHER'
  | 'PETS'
  | 'SALARY'
  | 'SHOPPING'
  | 'TAXES'
  | 'TRANSFER'
  | 'TRANSPORT'
  | 'TRAVEL'
  | 'UTILITIES'
  | 'VEHICLE';

export type OneOffPaymentInput = {
  account?: string | number | null | undefined;
  amount?: number | null | undefined;
  category?: OneOffPaymentCategory | null | undefined;
  dueDate?: string | null | undefined;
  name?: string | null | undefined;
  type?: PaymentType | null | undefined;
};

export type PayFrequency =
  'ANNUAL' | 'BIANNUAL' | 'FORTNIGHTLY' | 'FOUR_WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type PaydayInput = {
  account?: string | number | null | undefined;
  bankHolidayRegion?: BankHolidayRegion | null | undefined;
  dayOfMonth?: number | null | undefined;
  firstPayDate?: string | null | undefined;
  frequency: PayFrequency;
  type: PaydayType;
  weekday?: Weekday | null | undefined;
};

export type PaydayType = 'LAST_DAY' | 'LAST_FRIDAY' | 'SET_DAY' | 'SET_WEEKDAY';

export type PaymentFrequency = 'ANNUALLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type PaymentType = 'EXPENSE' | 'INCOME';

export type RecurringPaymentCategory =
  | 'BUSINESS'
  | 'CHARITY'
  | 'CHILDCARE'
  | 'CREDIT_CARD'
  | 'EDUCATION'
  | 'FOOD'
  | 'HEALTHCARE'
  | 'HOME_MAINTENANCE'
  | 'INSURANCE'
  | 'INVESTMENT'
  | 'LOAN'
  | 'MEMBERSHIP'
  | 'MORTGAGE'
  | 'OTHER'
  | 'RENT'
  | 'SAVINGS'
  | 'SUBSCRIPTION'
  | 'TAX'
  | 'TRANSPORT'
  | 'UTILITIES'
  | 'VEHICLE';

export type RecurringPaymentInput = {
  amount: number;
  category: RecurringPaymentCategory;
  firstPaymentDate: string;
  frequency: PaymentFrequency;
  lastPaymentDate?: string | null | undefined;
  name: string;
  type: PaymentType;
};

export type UserInput = {
  account?: string | number | null | undefined;
  email: string;
  firstName: string;
  password: string;
  surname: string;
};

export type Weekday = 'FRIDAY' | 'MONDAY' | 'THURSDAY' | 'TUESDAY' | 'WEDNESDAY';

export type CreateAccountMutationVariables = Exact<{
  account: CreateAccountInput;
}>;

export type CreateAccountMutation = {
  createAccount: {
    success: boolean | null;
    account: {
      id: string;
      bankBalance: number;
      monthlyIncome: number;
      bills: Array<{ id: string; name: string; amount: number; paid: boolean } | null> | null;
      oneOffPayments: Array<{ id: string; name: string; amount: number } | null> | null;
      payday: {
        frequency: PayFrequency;
        type: PaydayType;
        dayOfMonth: number | null;
        weekday: Weekday | null;
        firstPayDate: string | null;
        bankHolidayRegion: BankHolidayRegion | null;
      } | null;
    } | null;
  };
};

export type CreateBillMutationVariables = Exact<{
  bill: BillInput;
}>;

export type CreateBillMutation = {
  createBill: {
    success: boolean | null;
    bill: { id: string; name: string; amount: number; paid: boolean } | null;
  };
};

export type CreateNoteMutationVariables = Exact<{
  note: NoteInput;
}>;

export type CreateNoteMutation = {
  createNote: {
    success: boolean | null;
    note: { id: string; body: string; createdAt: string; updatedAt: string } | null;
  };
};

export type CreateOneOffPaymentMutationVariables = Exact<{
  oneOffPayment: OneOffPaymentInput;
}>;

export type CreateOneOffPaymentMutation = {
  createOneOffPayment: {
    success: boolean | null;
    oneOffPayment: {
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: PaymentType;
      category: OneOffPaymentCategory;
    } | null;
  };
};

export type DeleteBillMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteBillMutation = {
  deleteBill: { success: boolean | null; bill: { id: string } | null };
};

export type DeleteNoteMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteNoteMutation = {
  deleteNote: { success: boolean | null; note: { id: string } | null };
};

export type DeleteOneOffPaymentMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteOneOffPaymentMutation = {
  deleteOneOffPayment: {
    success: boolean | null;
    oneOffPayment: { id: string; amount: number } | null;
  };
};

export type EditAccountMutationVariables = Exact<{
  id: string | number;
  account: EditAccountInput;
}>;

export type EditAccountMutation = {
  editAccount: {
    success: boolean | null;
    account: { bankBalance: number; monthlyIncome: number } | null;
  };
};

export type EditBillMutationVariables = Exact<{
  id: string | number;
  bill: BillInput;
}>;

export type EditBillMutation = {
  editBill: {
    success: boolean | null;
    bill: { id: string; name: string; amount: number; paid: boolean } | null;
  };
};

export type EditNoteMutationVariables = Exact<{
  id: string | number;
  note: NoteInput;
}>;

export type EditNoteMutation = {
  editNote: {
    success: boolean | null;
    note: { id: string; body: string; createdAt: string; updatedAt: string } | null;
  };
};

export type EditOneOffPaymentMutationVariables = Exact<{
  id: string | number;
  oneOffPayment: OneOffPaymentInput;
}>;

export type EditOneOffPaymentMutation = {
  editOneOffPayment: {
    success: boolean | null;
    oneOffPayment: {
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: PaymentType;
      category: OneOffPaymentCategory;
    } | null;
  };
};

export type RegisterAndLoginMutationVariables = Exact<{
  user: UserInput;
}>;

export type RegisterAndLoginMutation = {
  registerAndLogin: {
    token: string;
    user: { id: string; email: string; firstName: string; surname: string };
  };
};

export type AccountQueryVariables = Exact<{
  id?: string | number | null | undefined;
}>;

export type AccountQuery = {
  account: {
    id: string;
    bankBalance: number;
    monthlyIncome: number;
    bills: Array<{ id: string; name: string; amount: number; paid: boolean } | null> | null;
    oneOffPayments: Array<{
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: PaymentType;
      category: OneOffPaymentCategory;
    } | null> | null;
    notes: Array<{ id: string; body: string; createdAt: string; updatedAt: string } | null> | null;
    payday: {
      frequency: PayFrequency;
      type: PaydayType;
      dayOfMonth: number | null;
      weekday: Weekday | null;
      firstPayDate: string | null;
      bankHolidayRegion: BankHolidayRegion | null;
    } | null;
  } | null;
};

export type LoginQueryVariables = Exact<{
  email: string;
  password: string;
}>;

export type LoginQuery = {
  login: { token: string; user: { id: string; email: string; firstName: string; surname: string } };
};

export type TokenFindUserQueryVariables = Exact<{ [key: string]: never }>;

export type TokenFindUserQuery = {
  tokenFindUser: { id: string; email: string; firstName: string; surname: string } | null;
};
