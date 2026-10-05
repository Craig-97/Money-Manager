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
  bankBalance: Scalars['Float']['output'];
  bills: Maybe<Array<Maybe<Bill>>>;
  cycleStartedOn: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  monthlyIncome: Scalars['Float']['output'];
  notes: Maybe<Array<Maybe<Note>>>;
  oneOffPayments: Maybe<Array<Maybe<OneOffPayment>>>;
  payday: Maybe<Payday>;
  recurringPayments: Maybe<Array<Maybe<RecurringPayment>>>;
  user: Maybe<User>;
};

export type AccountResponse = {
  __typename: 'AccountResponse';
  account: Maybe<Account>;
  success: Maybe<Scalars['Boolean']['output']>;
};

export type AuthData = {
  __typename: 'AuthData';
  token: Scalars['String']['output'];
  tokenExpiration: Scalars['Int']['output'];
  user: User;
};

export type BankHolidayRegion = 'ENGLAND_AND_WALES' | 'NORTHERN_IRELAND' | 'SCOTLAND';

export type BatchBillResponse = {
  __typename: 'BatchBillResponse';
  bills: Array<Maybe<Bill>>;
  success: Scalars['Boolean']['output'];
  updatedCount: Scalars['Int']['output'];
};

export type BatchBillUpdateInput = {
  ids: Array<Scalars['ID']['input']>;
  paid: Scalars['Boolean']['input'];
};

export type BatchDeleteResponse = {
  __typename: 'BatchDeleteResponse';
  deletedCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type BatchOneOffPaymentResponse = {
  __typename: 'BatchOneOffPaymentResponse';
  deletedCount: Scalars['Int']['output'];
  oneOffPayments: Array<Maybe<OneOffPayment>>;
  success: Scalars['Boolean']['output'];
};

export type BatchRecurringPaymentResponse = {
  __typename: 'BatchRecurringPaymentResponse';
  recurringPayments: Array<RecurringPayment>;
  success: Scalars['Boolean']['output'];
};

export type BatchUpdateRecurringPaymentInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<RecurringPaymentCategory>;
  firstPaymentDate?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<PaymentFrequency>;
  id: Scalars['ID']['input'];
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PaymentStatus>;
  type?: InputMaybe<PaymentType>;
};

export type Bill = {
  __typename: 'Bill';
  account: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  paid: Scalars['Boolean']['output'];
};

export type BillInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  amount?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  paid?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BillResponse = {
  __typename: 'BillResponse';
  bill: Maybe<Bill>;
  success: Maybe<Scalars['Boolean']['output']>;
};

export type CreateAccountInput = {
  bankBalance: Scalars['Float']['input'];
  bills?: InputMaybe<Array<InputMaybe<BillInput>>>;
  monthlyIncome: Scalars['Float']['input'];
  oneOffPayments?: InputMaybe<Array<InputMaybe<OneOffPaymentInput>>>;
  payday?: InputMaybe<PaydayInput>;
  recurringPayments?: InputMaybe<Array<InputMaybe<RecurringPaymentInput>>>;
  userId: Scalars['ID']['input'];
};

export type CreateRecurringPaymentInput = {
  accountId: Scalars['ID']['input'];
  amount: Scalars['Float']['input'];
  category: RecurringPaymentCategory;
  firstPaymentDate: Scalars['String']['input'];
  frequency: PaymentFrequency;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: PaymentType;
};

export type EditAccountInput = {
  bankBalance?: InputMaybe<Scalars['Float']['input']>;
  monthlyIncome?: InputMaybe<Scalars['Float']['input']>;
};

export type MarkPaymentsPaidInput = {
  accountId: Scalars['ID']['input'];
  oneOffPaymentIds: Array<Scalars['ID']['input']>;
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type MarkPaymentsUnpaidInput = {
  accountId: Scalars['ID']['input'];
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename: 'Mutation';
  batchDeleteBills: BatchDeleteResponse;
  batchDeleteOneOffPayments: BatchOneOffPaymentResponse;
  batchDeleteRecurringPayments: BatchDeleteResponse;
  batchUpdateBills: BatchBillResponse;
  batchUpdateRecurringPayments: BatchRecurringPaymentResponse;
  changePassword: UserResponse;
  createAccount: AccountResponse;
  createBill: BillResponse;
  createNote: NoteResponse;
  createOneOffPayment: OneOffPaymentResponse;
  createPayday: PaydayResponse;
  createRecurringPayment: RecurringPaymentResponse;
  createUser: UserResponse;
  deleteAccount: AccountResponse;
  deleteBill: BillResponse;
  deleteCurrentUser: UserResponse;
  deleteNote: NoteResponse;
  deleteOneOffPayment: OneOffPaymentResponse;
  deletePayday: PaydayResponse;
  deleteRecurringPayment: RecurringPaymentResponse;
  deleteUser: UserResponse;
  editAccount: AccountResponse;
  editBill: BillResponse;
  editNote: NoteResponse;
  editOneOffPayment: OneOffPaymentResponse;
  editPayday: PaydayResponse;
  editUser: UserResponse;
  login: AuthData;
  logout: PasswordResetResponse;
  markPaymentsPaid: AccountResponse;
  markPaymentsUnpaid: AccountResponse;
  refreshSession: AuthData;
  registerAndLogin: AuthData;
  requestPasswordReset: PasswordResetResponse;
  resetPassword: AuthData;
  setPaydayOverride: PaydayResponse;
  startPaydayCycle: AccountResponse;
  updateCurrentUser: UserResponse;
  updatePreferences: UserResponse;
  updateRecurringPayment: RecurringPaymentResponse;
};

export type MutationBatchDeleteBillsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationBatchDeleteOneOffPaymentsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationBatchDeleteRecurringPaymentsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationBatchUpdateBillsArgs = {
  input: BatchBillUpdateInput;
};

export type MutationBatchUpdateRecurringPaymentsArgs = {
  input: Array<BatchUpdateRecurringPaymentInput>;
};

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type MutationCreateAccountArgs = {
  account: CreateAccountInput;
};

export type MutationCreateBillArgs = {
  bill: BillInput;
};

export type MutationCreateNoteArgs = {
  note: NoteInput;
};

export type MutationCreateOneOffPaymentArgs = {
  oneOffPayment: OneOffPaymentInput;
};

export type MutationCreatePaydayArgs = {
  payday: PaydayInput;
};

export type MutationCreateRecurringPaymentArgs = {
  input: CreateRecurringPaymentInput;
};

export type MutationCreateUserArgs = {
  user: UserInput;
};

export type MutationDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteBillArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteOneOffPaymentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePaydayArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteRecurringPaymentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationEditAccountArgs = {
  account: EditAccountInput;
  id: Scalars['ID']['input'];
};

export type MutationEditBillArgs = {
  bill: BillInput;
  id: Scalars['ID']['input'];
};

export type MutationEditNoteArgs = {
  id: Scalars['ID']['input'];
  note: NoteInput;
};

export type MutationEditOneOffPaymentArgs = {
  id: Scalars['ID']['input'];
  oneOffPayment: OneOffPaymentInput;
};

export type MutationEditPaydayArgs = {
  id: Scalars['ID']['input'];
  payday: PaydayInput;
};

export type MutationEditUserArgs = {
  id: Scalars['ID']['input'];
  user: UserInput;
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
  user?: InputMaybe<UserInput>;
};

export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
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

export type MutationStartPaydayCycleArgs = {
  input: StartPaydayCycleInput;
};

export type MutationUpdateCurrentUserArgs = {
  input: UserDetailsInput;
};

export type MutationUpdatePreferencesArgs = {
  accent?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<ThemePreference>;
};

export type MutationUpdateRecurringPaymentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRecurringPaymentInput;
};

export type Note = {
  __typename: 'Note';
  account: Scalars['ID']['output'];
  body: Scalars['String']['output'];
  color: NoteColor;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type NoteColor = 'AMBER' | 'BLUE' | 'GREEN' | 'ROSE' | 'VIOLET';

export type NoteInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<NoteColor>;
};

export type NoteResponse = {
  __typename: 'NoteResponse';
  note: Maybe<Note>;
  success: Maybe<Scalars['Boolean']['output']>;
};

export type OneOffPayment = {
  __typename: 'OneOffPayment';
  account: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
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
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<OneOffPaymentCategory>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PaymentType>;
};

export type OneOffPaymentResponse = {
  __typename: 'OneOffPaymentResponse';
  oneOffPayment: Maybe<OneOffPayment>;
  success: Maybe<Scalars['Boolean']['output']>;
};

export type PasswordResetResponse = {
  __typename: 'PasswordResetResponse';
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
  account: Scalars['ID']['output'];
  bankHolidayRegion: Maybe<BankHolidayRegion>;
  dayOfMonth: Maybe<Scalars['Int']['output']>;
  firstPayDate: Maybe<Scalars['String']['output']>;
  frequency: PayFrequency;
  id: Scalars['ID']['output'];
  overrides: Array<PaydayOverride>;
  type: PaydayType;
  weekday: Maybe<Weekday>;
};

export type PaydayInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
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
  success: Maybe<Scalars['Boolean']['output']>;
};

export type PaydayType = 'LAST_DAY' | 'LAST_WEEKDAY' | 'SET_DAY' | 'SET_WEEKDAY';

export type PaymentFrequency = 'ANNUALLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type PaymentStatus = 'PAID' | 'SKIPPED' | 'UNPAID';

export type PaymentType = 'EXPENSE' | 'INCOME';

export type Query = {
  __typename: 'Query';
  account: Maybe<Account>;
  accounts: Array<Account>;
  bill: Maybe<Bill>;
  bills: Array<Bill>;
  note: Maybe<Note>;
  notes: Array<Note>;
  oneOffPayment: Maybe<OneOffPayment>;
  oneOffPayments: Array<OneOffPayment>;
  passwordResetTokenValid: PasswordResetTokenCheck;
  payday: Maybe<Payday>;
  paydays: Array<Payday>;
  recurringPayment: Maybe<RecurringPayment>;
  recurringPayments: Array<RecurringPayment>;
  tokenFindUser: Maybe<User>;
  user: Maybe<User>;
  users: Array<User>;
};

export type QueryAccountArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryBillArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryBillsArgs = {
  accountId: Scalars['ID']['input'];
};

export type QueryNoteArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryNotesArgs = {
  accountId: Scalars['ID']['input'];
};

export type QueryOneOffPaymentArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryOneOffPaymentsArgs = {
  accountId: Scalars['ID']['input'];
};

export type QueryPasswordResetTokenValidArgs = {
  token: Scalars['String']['input'];
};

export type QueryPaydayArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryRecurringPaymentArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRecurringPaymentsArgs = {
  accountId: Scalars['ID']['input'];
};

export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type RecurringPayment = {
  __typename: 'RecurringPayment';
  account: Account;
  amount: Scalars['Float']['output'];
  category: RecurringPaymentCategory;
  firstPaymentDate: Scalars['String']['output'];
  frequency: PaymentFrequency;
  id: Scalars['ID']['output'];
  lastPaymentDate: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextDueDate: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
  type: PaymentType;
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
  amount: Scalars['Float']['input'];
  category: RecurringPaymentCategory;
  firstPaymentDate: Scalars['String']['input'];
  frequency: PaymentFrequency;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: PaymentType;
};

export type RecurringPaymentResponse = {
  __typename: 'RecurringPaymentResponse';
  recurringPayment: Maybe<RecurringPayment>;
  success: Scalars['Boolean']['output'];
};

export type StartPaydayCycleInput = {
  accountId: Scalars['ID']['input'];
  bankBalance: Scalars['Float']['input'];
  payday: Scalars['String']['input'];
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type ThemePreference = 'DARK' | 'LIGHT' | 'SYSTEM';

export type UpdateRecurringPaymentInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<RecurringPaymentCategory>;
  firstPaymentDate?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<PaymentFrequency>;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PaymentStatus>;
  type?: InputMaybe<PaymentType>;
};

export type User = {
  __typename: 'User';
  accent: Maybe<Scalars['String']['output']>;
  account: Maybe<Scalars['ID']['output']>;
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

export type UserInput = {
  account?: InputMaybe<Scalars['ID']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  surname: Scalars['String']['input'];
};

export type UserResponse = {
  __typename: 'UserResponse';
  account: Maybe<Scalars['ID']['output']>;
  success: Maybe<Scalars['Boolean']['output']>;
  user: Maybe<User>;
};

export type Weekday = 'FRIDAY' | 'MONDAY' | 'THURSDAY' | 'TUESDAY' | 'WEDNESDAY';
