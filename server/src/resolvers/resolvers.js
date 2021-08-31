const account = require('./account');
const bill = require('./bill');

export const resolvers = [account.resolvers, bill.resolvers];
