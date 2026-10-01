// Subset of the Money Manager API schema, covering every operation the frontend sends.
// Keeping it in the test tree means queries and variables are validated like a real server would.
export const typeDefs = /* GraphQL */ `
  type Query {
    account(id: ID): Account
    tokenFindUser: User
    login(email: String!, password: String!): AuthData!
  }

  type Mutation {
    registerAndLogin(user: UserInput!): AuthData!
    createAccount(account: CreateAccountInput!): AccountResponse!
    editAccount(id: ID!, account: EditAccountInput!): AccountResponse!
    createBill(bill: BillInput!): BillResponse!
    editBill(id: ID!, bill: BillInput!): BillResponse!
    deleteBill(id: ID!): BillResponse!
    createNote(note: NoteInput!): NoteResponse!
    editNote(id: ID!, note: NoteInput!): NoteResponse!
    deleteNote(id: ID!): NoteResponse!
    createOneOffPayment(oneOffPayment: OneOffPaymentInput!): OneOffPaymentResponse!
    editOneOffPayment(id: ID!, oneOffPayment: OneOffPaymentInput!): OneOffPaymentResponse!
    deleteOneOffPayment(id: ID!): OneOffPaymentResponse!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    surname: String!
  }

  type AuthData {
    user: User!
    token: String!
    tokenExpiration: Int
  }

  input UserInput {
    email: String!
    password: String!
    firstName: String!
    surname: String!
  }

  type Account {
    id: ID!
    bankBalance: Float!
    monthlyIncome: Float!
    bills: [Bill]
    oneOffPayments: [OneOffPayment]
    notes: [Note]
    payday: Payday
  }

  type AccountResponse {
    account: Account
    success: Boolean
  }

  input CreateAccountInput {
    bankBalance: Float!
    monthlyIncome: Float!
    bills: [BillInput]
    oneOffPayments: [OneOffPaymentInput]
    payday: PaydayInput
    userId: ID!
  }

  input EditAccountInput {
    bankBalance: Float
    monthlyIncome: Float
  }

  type Bill {
    id: ID!
    account: ID
    name: String!
    amount: Float!
    paid: Boolean!
  }

  input BillInput {
    account: ID
    name: String
    amount: Float
    paid: Boolean
  }

  type BillResponse {
    bill: Bill
    success: Boolean
  }

  enum PaymentType {
    INCOME
    EXPENSE
  }

  type OneOffPayment {
    id: ID!
    account: ID
    name: String!
    amount: Float!
    dueDate: String!
    type: PaymentType!
    category: String!
  }

  input OneOffPaymentInput {
    account: ID
    name: String
    amount: Float
    dueDate: String
    type: PaymentType
    category: String
  }

  type OneOffPaymentResponse {
    oneOffPayment: OneOffPayment
    success: Boolean
  }

  type Note {
    id: ID!
    account: ID
    body: String!
    createdAt: String!
    updatedAt: String!
  }

  input NoteInput {
    account: ID
    body: String
  }

  type NoteResponse {
    note: Note
    success: Boolean
  }

  type Payday {
    id: ID
    account: ID
    frequency: String!
    type: String!
    dayOfMonth: Int
    weekday: String
    firstPayDate: String
    bankHolidayRegion: String
  }

  input PaydayInput {
    account: ID
    frequency: String!
    type: String!
    dayOfMonth: Int
    weekday: String
    firstPayDate: String
    bankHolidayRegion: String
  }
`;
