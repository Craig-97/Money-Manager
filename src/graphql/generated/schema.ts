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
  success: Scalars['Boolean']['output'];
};

export type AuthData = {
  __typename: 'AuthData';
  token: Scalars['String']['output'];
  tokenExpiration: Scalars['Int']['output'];
  user: User;
};

export type BankHolidayRegion = 'ENGLAND_AND_WALES' | 'NORTHERN_IRELAND' | 'SCOTLAND';

export type CreateAccountInput = {
  bankBalance: Scalars['Float']['input'];
  monthlyIncome: Scalars['Float']['input'];
  oneOffPayments?: InputMaybe<Array<OneOffPaymentInput>>;
  payday?: InputMaybe<PaydayInput>;
  recurringPayments?: InputMaybe<Array<RecurringPaymentInput>>;
};

export type CreateNoteInput = {
  accountId: Scalars['ID']['input'];
  body: Scalars['String']['input'];
  color?: InputMaybe<NoteColor>;
};

export type CreateOneOffPaymentInput = {
  accountId: Scalars['ID']['input'];
  amount: Scalars['Float']['input'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: PaymentType;
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

export type DeleteResponse = {
  __typename: 'DeleteResponse';
  deletedCount: Scalars['Int']['output'];
  ids: Array<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
};

export type HandledDates = {
  __typename: 'HandledDates';
  dates: Array<Scalars['String']['output']>;
  outcome: PaymentOutcome;
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
  batchDeleteOneOffPayments: DeleteResponse;
  batchDeleteRecurringPayments: DeleteResponse;
  changePassword: UserResponse;
  createAccount: AccountResponse;
  createNote: NoteResponse;
  createOneOffPayment: OneOffPaymentResponse;
  createRecurringPayment: RecurringPaymentResponse;
  deleteCurrentUser: UserResponse;
  deleteNote: DeleteResponse;
  login: AuthData;
  logout: SuccessResponse;
  logoutEverywhere: SuccessResponse;
  markPaymentsPaid: AccountResponse;
  markPaymentsUnpaid: AccountResponse;
  refreshSession: AuthData;
  registerAndLogin: AuthData;
  requestPasswordReset: SuccessResponse;
  resetPassword: AuthData;
  setPaydayOverride: PaydayResponse;
  skipRecurringPayments: AccountResponse;
  startPaydayCycle: AccountResponse;
  updateAccount: AccountResponse;
  updateCurrentUser: UserResponse;
  updateNote: NoteResponse;
  updateOneOffPayment: OneOffPaymentResponse;
  updatePayday: PaydayResponse;
  updatePreferences: UserResponse;
  updateRecurringPayment: RecurringPaymentResponse;
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

export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};

export type MutationCreateOneOffPaymentArgs = {
  input: CreateOneOffPaymentInput;
};

export type MutationCreateRecurringPaymentArgs = {
  input: CreateRecurringPaymentInput;
};

export type MutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
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

export type MutationUpdateAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAccountInput;
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

export type NoteResponse = {
  __typename: 'NoteResponse';
  note: Maybe<Note>;
  success: Scalars['Boolean']['output'];
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
  amount: Scalars['Float']['input'];
  category: OneOffPaymentCategory;
  dueDate: Scalars['String']['input'];
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

export type PaymentFrequency = 'ANNUALLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';

export type PaymentOutcome = 'PAID' | 'SKIPPED';

export type PaymentType = 'EXPENSE' | 'INCOME';

export type Query = {
  __typename: 'Query';
  account: Maybe<Account>;
  passwordResetTokenValid: PasswordResetTokenCheck;
  tokenFindUser: Maybe<User>;
};

export type QueryAccountArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryPasswordResetTokenValidArgs = {
  token: Scalars['String']['input'];
};

export type RecurringPayment = {
  __typename: 'RecurringPayment';
  account: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
  category: RecurringPaymentCategory;
  firstPaymentDate: Scalars['String']['output'];
  frequency: PaymentFrequency;
  handled: Array<HandledDates>;
  id: Scalars['ID']['output'];
  lastPaymentDate: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextDueDate: Maybe<Scalars['String']['output']>;
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

export type RegisterInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  surname: Scalars['String']['input'];
};

export type SkipRecurringPaymentsInput = {
  accountId: Scalars['ID']['input'];
  recurringPaymentIds: Array<Scalars['ID']['input']>;
  until?: InputMaybe<Scalars['String']['input']>;
};

export type StartPaydayCycleInput = {
  accountId: Scalars['ID']['input'];
  bankBalance: Scalars['Float']['input'];
  payday: Scalars['String']['input'];
  recurringPaymentIds: Array<Scalars['ID']['input']>;
};

export type SuccessResponse = {
  __typename: 'SuccessResponse';
  success: Scalars['Boolean']['output'];
};

export type ThemePreference = 'DARK' | 'LIGHT' | 'SYSTEM';

export type UpdateAccountInput = {
  bankBalance?: InputMaybe<Scalars['Float']['input']>;
  monthlyIncome?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateNoteInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<NoteColor>;
};

export type UpdateOneOffPaymentInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<OneOffPaymentCategory>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PaymentType>;
};

export type UpdateRecurringPaymentInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<RecurringPaymentCategory>;
  firstPaymentDate?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<PaymentFrequency>;
  lastPaymentDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type UserResponse = {
  __typename: 'UserResponse';
  account: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type Weekday = 'FRIDAY' | 'MONDAY' | 'THURSDAY' | 'TUESDAY' | 'WEDNESDAY';
