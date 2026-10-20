export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Account = {
  __typename: 'Account';
  balance: Scalars['Float']['output'];
  balanceUpdatedAt: Scalars['String']['output'];
  counts: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  interestRate: Maybe<Scalars['Float']['output']>;
  kind: AccountKind;
  name: Scalars['String']['output'];
  paidInto: Scalars['Boolean']['output'];
  purpose: Maybe<Scalars['String']['output']>;
};

export type AccountBalanceInput = {
  accountId: Scalars['ID']['input'];
  balance: Scalars['Float']['input'];
};

export type AccountKind = 'SAVINGS' | 'SPENDING';

export type AccountResponse = {
  __typename: 'AccountResponse';
  account: Maybe<Account>;
  budget: Maybe<Budget>;
  success: Scalars['Boolean']['output'];
};

export type AlreadyPaidInput = {
  oneOffPaymentIds: Array<Scalars['ID']['input']>;
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type AssignPaymentAccountsInput = {
  budgetId: Scalars['ID']['input'];
  payments: Array<PaymentAccountInput>;
};

export type AuthData = {
  __typename: 'AuthData';
  token: Scalars['String']['output'];
  tokenExpiration: Scalars['Int']['output'];
  user: User;
};

export type BankHolidayRegion = 'ENGLAND_AND_WALES' | 'NORTHERN_IRELAND' | 'SCOTLAND';

export type Budget = {
  __typename: 'Budget';
  accounts: Array<Account>;
  bankBalance: Scalars['Float']['output'];
  calendarFeed: CalendarFeed;
  cycleStartedOn: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  monthlyIncome: Scalars['Float']['output'];
  notes: Maybe<Array<Maybe<Note>>>;
  oneOffPayments: Maybe<Array<Maybe<OneOffPayment>>>;
  payday: Maybe<Payday>;
  recurringPayments: Maybe<Array<Maybe<RecurringPayment>>>;
  reminderSettings: ReminderSettings;
  reminderStates: Array<ReminderState>;
  user: Maybe<User>;
};

export type BudgetAccountInput = {
  balance: Scalars['Float']['input'];
  counts?: InputMaybe<Scalars['Boolean']['input']>;
  interestRate?: InputMaybe<Scalars['Float']['input']>;
  key: Scalars['String']['input'];
  kind?: InputMaybe<AccountKind>;
  name: Scalars['String']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
};

export type BudgetResponse = {
  __typename: 'BudgetResponse';
  budget: Maybe<Budget>;
  success: Scalars['Boolean']['output'];
};

export type CalendarFeed = {
  __typename: 'CalendarFeed';
  debtFree: Scalars['Boolean']['output'];
  notes: Scalars['Boolean']['output'];
  paydays: Scalars['Boolean']['output'];
  payments: Scalars['Boolean']['output'];
  renewals: Scalars['Boolean']['output'];
  showAmounts: Scalars['Boolean']['output'];
  token: Maybe<Scalars['String']['output']>;
};

export type CreateAccountInput = {
  balance: Scalars['Float']['input'];
  budgetId: Scalars['ID']['input'];
  counts?: InputMaybe<Scalars['Boolean']['input']>;
  interestRate?: InputMaybe<Scalars['Float']['input']>;
  kind?: InputMaybe<AccountKind>;
  name: Scalars['String']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBudgetInput = {
  accounts?: InputMaybe<Array<BudgetAccountInput>>;
  bankBalance: Scalars['Float']['input'];
  monthlyIncome: Scalars['Float']['input'];
  oneOffPayments?: InputMaybe<Array<OneOffPaymentInput>>;
  paidIntoName?: InputMaybe<Scalars['String']['input']>;
  payday?: InputMaybe<PaydayInput>;
  recurringPayments?: InputMaybe<Array<RecurringPaymentInput>>;
};

export type CreateNoteInput = {
  body: Scalars['String']['input'];
  budgetId: Scalars['ID']['input'];
  color?: InputMaybe<NoteColor>;
  date?: InputMaybe<Scalars['String']['input']>;
  payment?: InputMaybe<Scalars['ID']['input']>;
  remind?: InputMaybe<Array<Scalars['Int']['input']>>;
  repeat?: InputMaybe<NoteRepeat>;
};

export type CreateOneOffPaymentInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  amount: Scalars['Float']['input'];
  budgetId: Scalars['ID']['input'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['input'];
  dueReminder?: InputMaybe<ReminderTimingInput>;
  name: Scalars['String']['input'];
  type: PaymentType;
};

export type CreateRecurringPaymentInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  amount: Scalars['Float']['input'];
  budgetId: Scalars['ID']['input'];
  category: RecurringPaymentCategory;
  debt?: InputMaybe<DebtInput>;
  dueReminder?: InputMaybe<ReminderTimingInput>;
  firstPaymentDate: Scalars['String']['input'];
  frequency: PaymentFrequency;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  paysInto?: InputMaybe<Scalars['ID']['input']>;
  renewalDate?: InputMaybe<Scalars['String']['input']>;
  renewalReminder?: InputMaybe<ReminderTimingInput>;
  type: PaymentType;
};

export type Debt = {
  __typename: 'Debt';
  apr: Scalars['Float']['output'];
  balance: Scalars['Float']['output'];
  balanceUpdatedAt: Maybe<Scalars['String']['output']>;
  paidOffThisCycle: Scalars['Float']['output'];
  startingBalance: Maybe<Scalars['Float']['output']>;
};

export type DebtInput = {
  apr: Scalars['Float']['input'];
  balance: Scalars['Float']['input'];
  startingBalance?: InputMaybe<Scalars['Float']['input']>;
};

export type DeleteResponse = {
  __typename: 'DeleteResponse';
  deletedCount: Scalars['Int']['output'];
  ids: Array<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
};

export type LeftOverOutcome = 'DUE' | 'PAID' | 'SKIPPED';

export type LeftOverPaymentInput = {
  outcome: LeftOverOutcome;
  recurringPaymentId: Scalars['ID']['input'];
};

export type LogDebtOverpaymentInput = {
  amount: Scalars['Float']['input'];
  budgetId: Scalars['ID']['input'];
  recurringPaymentId: Scalars['ID']['input'];
};

export type MarkPaymentsPaidInput = {
  budgetId: Scalars['ID']['input'];
  oneOffPaymentIds: Array<Scalars['ID']['input']>;
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type MarkPaymentsUnpaidInput = {
  budgetId: Scalars['ID']['input'];
  oneOffPaymentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename: 'Mutation';
  assignPaymentAccounts: BudgetResponse;
  batchDeleteOneOffPayments: DeleteResponse;
  batchDeleteRecurringPayments: DeleteResponse;
  changePassword: UserResponse;
  createAccount: AccountResponse;
  createBudget: BudgetResponse;
  createNote: NoteResponse;
  createOneOffPayment: OneOffPaymentResponse;
  createRecurringPayment: RecurringPaymentResponse;
  deleteAccount: AccountResponse;
  deleteCurrentUser: UserResponse;
  deleteNote: DeleteResponse;
  logDebtOverpayment: BudgetResponse;
  login: AuthData;
  logout: SuccessResponse;
  logoutEverywhere: SuccessResponse;
  markPaymentsPaid: BudgetResponse;
  markPaymentsUnpaid: BudgetResponse;
  refreshSession: AuthData;
  registerAndLogin: AuthData;
  requestPasswordReset: SuccessResponse;
  resetCalendarFeed: BudgetResponse;
  resetPassword: AuthData;
  setPaydayOverride: PaydayResponse;
  skipRecurringPayments: BudgetResponse;
  startPaydayCycle: BudgetResponse;
  undoDebtOverpayment: BudgetResponse;
  updateAccount: AccountResponse;
  updateAccountBalances: BudgetResponse;
  updateBudget: BudgetResponse;
  updateCalendarFeed: BudgetResponse;
  updateCurrentUser: UserResponse;
  updateNote: NoteResponse;
  updateOneOffPayment: OneOffPaymentResponse;
  updatePayday: PaydayResponse;
  updatePreferences: UserResponse;
  updateRecurringPayment: RecurringPaymentResponse;
  updateReminderSettings: BudgetResponse;
  updateReminders: ReminderStatesResponse;
};

export type MutationAssignPaymentAccountsArgs = {
  input: AssignPaymentAccountsInput;
};

export type MutationBatchDeleteOneOffPaymentsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationBatchDeleteRecurringPaymentsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};

export type MutationCreateBudgetArgs = {
  input: CreateBudgetInput;
};

export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};

export type MutationCreateOneOffPaymentArgs = {
  input: CreateOneOffPaymentInput;
};

export type MutationCreateRecurringPaymentArgs = {
  input: CreateRecurringPaymentInput;
};

export type MutationDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLogDebtOverpaymentArgs = {
  input: LogDebtOverpaymentInput;
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationMarkPaymentsPaidArgs = {
  input: MarkPaymentsPaidInput;
};

export type MutationMarkPaymentsUnpaidArgs = {
  input: MarkPaymentsUnpaidInput;
};

export type MutationRegisterAndLoginArgs = {
  input: RegisterInput;
};

export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};

export type MutationResetCalendarFeedArgs = {
  budgetId: Scalars['ID']['input'];
};

export type MutationResetPasswordArgs = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationSetPaydayOverrideArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  for: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type MutationSkipRecurringPaymentsArgs = {
  input: SkipRecurringPaymentsInput;
};

export type MutationStartPaydayCycleArgs = {
  input: StartPaydayCycleInput;
};

export type MutationUndoDebtOverpaymentArgs = {
  input: UndoDebtOverpaymentInput;
};

export type MutationUpdateAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAccountInput;
};

export type MutationUpdateAccountBalancesArgs = {
  input: UpdateAccountBalancesInput;
};

export type MutationUpdateBudgetArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBudgetInput;
};

export type MutationUpdateCalendarFeedArgs = {
  input: UpdateCalendarFeedInput;
};

export type MutationUpdateCurrentUserArgs = {
  input: UserDetailsInput;
};

export type MutationUpdateNoteArgs = {
  id: Scalars['ID']['input'];
  input: UpdateNoteInput;
};

export type MutationUpdateOneOffPaymentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOneOffPaymentInput;
};

export type MutationUpdatePaydayArgs = {
  id: Scalars['ID']['input'];
  input: PaydayInput;
};

export type MutationUpdatePreferencesArgs = {
  accent?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<ThemePreference>;
};

export type MutationUpdateRecurringPaymentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRecurringPaymentInput;
};

export type MutationUpdateReminderSettingsArgs = {
  input: UpdateReminderSettingsInput;
};

export type MutationUpdateRemindersArgs = {
  input: UpdateRemindersInput;
};

export type Note = {
  __typename: 'Note';
  body: Scalars['String']['output'];
  budget: Scalars['ID']['output'];
  color: NoteColor;
  createdAt: Scalars['String']['output'];
  date: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  payment: Maybe<Scalars['ID']['output']>;
  remind: Array<Scalars['Int']['output']>;
  repeat: NoteRepeat;
  updatedAt: Scalars['String']['output'];
};

export type NoteColor = 'AMBER' | 'BLUE' | 'GREEN' | 'ROSE' | 'VIOLET';

export type NoteRepeat =
  'BIANNUALLY' | 'MONTHLY' | 'NONE' | 'QUARTERLY' | 'WITH_PAYMENT' | 'YEARLY';

export type NoteResponse = {
  __typename: 'NoteResponse';
  note: Maybe<Note>;
  success: Scalars['Boolean']['output'];
};

export type OneOffPayment = {
  __typename: 'OneOffPayment';
  account: Maybe<Scalars['ID']['output']>;
  amount: Scalars['Float']['output'];
  budget: Scalars['ID']['output'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['output'];
  dueReminder: ReminderTiming;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  paidAt: Maybe<Scalars['String']['output']>;
  type: PaymentType;
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
  account?: InputMaybe<Scalars['ID']['input']>;
  amount: Scalars['Float']['input'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['input'];
  dueReminder?: InputMaybe<ReminderTimingInput>;
  name: Scalars['String']['input'];
  type: PaymentType;
};

export type OneOffPaymentResponse = {
  __typename: 'OneOffPaymentResponse';
  oneOffPayment: Maybe<OneOffPayment>;
  success: Scalars['Boolean']['output'];
};

export type PasswordResetTokenCheck = {
  __typename: 'PasswordResetTokenCheck';
  email: Maybe<Scalars['String']['output']>;
  valid: Scalars['Boolean']['output'];
};

export type PayFrequency =
  'ANNUAL' | 'BIANNUAL' | 'FORTNIGHTLY' | 'FOUR_WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type Payday = {
  __typename: 'Payday';
  bankHolidayRegion: Maybe<BankHolidayRegion>;
  budget: Scalars['ID']['output'];
  dayOfMonth: Maybe<Scalars['Int']['output']>;
  firstPayDate: Maybe<Scalars['String']['output']>;
  frequency: PayFrequency;
  id: Scalars['ID']['output'];
  overrides: Array<PaydayOverride>;
  type: PaydayType;
  weekday: Maybe<Weekday>;
};

export type PaydayInput = {
  bankHolidayRegion?: InputMaybe<BankHolidayRegion>;
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  firstPayDate?: InputMaybe<Scalars['String']['input']>;
  frequency: PayFrequency;
  type: PaydayType;
  weekday?: InputMaybe<Weekday>;
};

export type PaydayOverride = {
  __typename: 'PaydayOverride';
  date: Scalars['String']['output'];
  for: Scalars['String']['output'];
};

export type PaydayResponse = {
  __typename: 'PaydayResponse';
  payday: Maybe<Payday>;
  success: Scalars['Boolean']['output'];
};

export type PaydayType = 'LAST_DAY' | 'LAST_WEEKDAY' | 'SET_DAY' | 'SET_WEEKDAY';

export type PaymentAccountInput = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
  recurringPaymentId: Scalars['ID']['input'];
};

export type PaymentFrequency =
  'ANNUALLY' | 'BIANNUALLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type PaymentRecord = {
  __typename: 'PaymentRecord';
  balanceChange: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  dates: Array<Scalars['String']['output']>;
  debt: Maybe<PaymentRecordDebt>;
  id: Scalars['ID']['output'];
  kind: PaymentRecordKind;
  open: Scalars['Boolean']['output'];
  transfer: Maybe<PaymentRecordTransfer>;
};

export type PaymentRecordDebt = {
  __typename: 'PaymentRecordDebt';
  balanceAfter: Scalars['Float']['output'];
  interest: Scalars['Float']['output'];
  reduction: Scalars['Float']['output'];
};

export type PaymentRecordKind = 'BALANCE_SET' | 'OVERPAYMENT' | 'PAID' | 'SKIPPED';

export type PaymentRecordTransfer = {
  __typename: 'PaymentRecordTransfer';
  account: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
};

export type PaymentType = 'EXPENSE' | 'INCOME';

export type Query = {
  __typename: 'Query';
  budget: Maybe<Budget>;
  passwordResetTokenValid: PasswordResetTokenCheck;
  recurringPayment: Maybe<RecurringPayment>;
  tokenFindUser: Maybe<User>;
};

export type QueryBudgetArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryPasswordResetTokenValidArgs = {
  token: Scalars['String']['input'];
};

export type QueryRecurringPaymentArgs = {
  id: Scalars['ID']['input'];
};

export type RecurringPayment = {
  __typename: 'RecurringPayment';
  account: Maybe<Scalars['ID']['output']>;
  amount: Scalars['Float']['output'];
  budget: Scalars['ID']['output'];
  category: RecurringPaymentCategory;
  debt: Maybe<Debt>;
  dueReminder: ReminderTiming;
  firstPaymentDate: Scalars['String']['output'];
  frequency: PaymentFrequency;
  history: Array<PaymentRecord>;
  id: Scalars['ID']['output'];
  lastPaymentDate: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextDueDate: Maybe<Scalars['String']['output']>;
  paysInto: Maybe<Scalars['ID']['output']>;
  renewalDate: Maybe<Scalars['String']['output']>;
  renewalReminder: ReminderTiming;
  thisCycle: Array<PaymentRecord>;
  type: PaymentType;
};

export type RecurringPaymentHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

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
  account?: InputMaybe<Scalars['ID']['input']>;
  amount: Scalars['Float']['input'];
  category: RecurringPaymentCategory;
  debt?: InputMaybe<DebtInput>;
  dueReminder?: InputMaybe<ReminderTimingInput>;
  firstPaymentDate: Scalars['String']['input'];
  frequency: PaymentFrequency;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  paysInto?: InputMaybe<Scalars['ID']['input']>;
  renewalDate?: InputMaybe<Scalars['String']['input']>;
  renewalReminder?: InputMaybe<ReminderTimingInput>;
  type: PaymentType;
};

export type RecurringPaymentResponse = {
  __typename: 'RecurringPaymentResponse';
  recurringPayment: Maybe<RecurringPayment>;
  success: Scalars['Boolean']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  surname: Scalars['String']['input'];
};

export type ReminderAction = 'CLEAR' | 'LATER' | 'READ' | 'RESTORE';

export type ReminderSettings = {
  __typename: 'ReminderSettings';
  payday: Scalars['Boolean']['output'];
  paymentDays: Scalars['Int']['output'];
  renewalDays: Scalars['Int']['output'];
};

export type ReminderState = {
  __typename: 'ReminderState';
  cleared: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  read: Scalars['Boolean']['output'];
  snoozedUntil: Maybe<Scalars['String']['output']>;
};

export type ReminderStatesResponse = {
  __typename: 'ReminderStatesResponse';
  states: Array<ReminderState>;
  success: Scalars['Boolean']['output'];
};

export type ReminderTiming = {
  __typename: 'ReminderTiming';
  days: Maybe<Scalars['Int']['output']>;
  off: Scalars['Boolean']['output'];
};

export type ReminderTimingInput = {
  days?: InputMaybe<Scalars['Int']['input']>;
  off: Scalars['Boolean']['input'];
};

export type SkipRecurringPaymentsInput = {
  budgetId: Scalars['ID']['input'];
  recurringPaymentIds: Array<Scalars['ID']['input']>;
  until?: InputMaybe<Scalars['String']['input']>;
};

export type StartPaydayCycleInput = {
  accountBalances?: InputMaybe<Array<AccountBalanceInput>>;
  alreadyPaid?: InputMaybe<AlreadyPaidInput>;
  budgetId: Scalars['ID']['input'];
  leftOver: Array<LeftOverPaymentInput>;
  paidIntoBalance: Scalars['Float']['input'];
  payday: Scalars['String']['input'];
};

export type SuccessResponse = {
  __typename: 'SuccessResponse';
  success: Scalars['Boolean']['output'];
};

export type ThemePreference = 'DARK' | 'LIGHT' | 'SYSTEM';

export type UndoDebtOverpaymentInput = {
  budgetId: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
};

export type UpdateAccountBalancesInput = {
  balances: Array<AccountBalanceInput>;
  budgetId: Scalars['ID']['input'];
};

export type UpdateAccountInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  counts?: InputMaybe<Scalars['Boolean']['input']>;
  interestRate?: InputMaybe<Scalars['Float']['input']>;
  kind?: InputMaybe<AccountKind>;
  name?: InputMaybe<Scalars['String']['input']>;
  paidInto?: InputMaybe<Scalars['Boolean']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBudgetInput = {
  monthlyIncome?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateCalendarFeedInput = {
  budgetId: Scalars['ID']['input'];
  debtFree?: InputMaybe<Scalars['Boolean']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['Boolean']['input']>;
  paydays?: InputMaybe<Scalars['Boolean']['input']>;
  payments?: InputMaybe<Scalars['Boolean']['input']>;
  renewals?: InputMaybe<Scalars['Boolean']['input']>;
  showAmounts?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateNoteInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<NoteColor>;
  date?: InputMaybe<Scalars['String']['input']>;
  payment?: InputMaybe<Scalars['ID']['input']>;
  remind?: InputMaybe<Array<Scalars['Int']['input']>>;
  repeat?: InputMaybe<NoteRepeat>;
};

export type UpdateOneOffPaymentInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<OneOffPaymentCategory>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  dueReminder?: InputMaybe<ReminderTimingInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PaymentType>;
};

export type UpdateRecurringPaymentInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<RecurringPaymentCategory>;
  debt?: InputMaybe<DebtInput>;
  dueReminder?: InputMaybe<ReminderTimingInput>;
  firstPaymentDate?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<PaymentFrequency>;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  paysInto?: InputMaybe<Scalars['ID']['input']>;
  renewalDate?: InputMaybe<Scalars['String']['input']>;
  renewalReminder?: InputMaybe<ReminderTimingInput>;
  type?: InputMaybe<PaymentType>;
};

export type UpdateReminderSettingsInput = {
  budgetId: Scalars['ID']['input'];
  payday?: InputMaybe<Scalars['Boolean']['input']>;
  paymentDays?: InputMaybe<Scalars['Int']['input']>;
  renewalDays?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateRemindersInput = {
  action: ReminderAction;
  budgetId: Scalars['ID']['input'];
  keys: Array<Scalars['String']['input']>;
  until?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename: 'User';
  accent: Maybe<Scalars['String']['output']>;
  budget: Maybe<Scalars['ID']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  surname: Scalars['String']['output'];
  theme: Maybe<ThemePreference>;
};

export type UserDetailsInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  surname: Scalars['String']['input'];
};

export type UserResponse = {
  __typename: 'UserResponse';
  budget: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type Weekday = 'FRIDAY' | 'MONDAY' | 'THURSDAY' | 'TUESDAY' | 'WEDNESDAY';
