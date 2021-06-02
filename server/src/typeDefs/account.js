exports.typeDefs = `
  type Query {
    accounts: [Account!]!
    account(id: ID): Account
  }

  type Account {
    id: ID!
    bankBalance: Float!
    monthlyIncome: Float!
    bankPaydayTotal: Float
  }

  input AccountInput {
    bankBalance: Float
    monthlyIncome: Float
  }

  type AccountResponse {
    account: Account
    success: Boolean
  }

  type Mutation {
    createAccount(account: AccountInput!): AccountResponse!
    updateAccount(id: ID!, account: AccountInput!): AccountResponse!
    deleteAccount(id: ID!): AccountResponse!
  }
`;
