const { mergeTypeDefs } = require('@graphql-tools/merge');
const account = require('./account');

const types = [account.typeDefs];

export const typeDefs = mergeTypeDefs(types);
