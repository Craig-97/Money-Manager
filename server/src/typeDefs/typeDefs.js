const { mergeTypeDefs } = require('@graphql-tools/merge');
const account = require('./account');
const bill = require('./bill');

const types = [account.typeDefs, bill.typeDefs];

export const typeDefs = mergeTypeDefs(types);
