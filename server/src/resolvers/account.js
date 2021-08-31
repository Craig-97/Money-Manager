import { Account } from '../models/Account';
import { calculateAccountValues } from './utils';

const createAccount = async (_, { account }) => {
  try {
    let newAccount = calculateAccountValues(account);
    newAccount = new Account(newAccount);
    await newAccount.save();
    return { account: newAccount, success: true };
  } catch (err) {
    throw err;
  }
};

const updateAccount = async (_, { id, account }) => {
  const currentAccount = await Account.findById(id);
  const mergedAccount = Object.assign(currentAccount, account);
  mergedAccount.__v = mergedAccount.__v + 1;
  const calculatedAccount = calculateAccountValues(mergedAccount);

  try {
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: id },
      calculatedAccount,
      {
        new: true
      }
    );
    return {
      account: updatedAccount,
      success: true
    };
  } catch (err) {
    throw err;
  }
};

const deleteAccount = async (_, { id }) => {
  try {
    await Account.deleteOne({ _id: id });
    return {
      success: true
    };
  } catch (err) {
    throw err;
  }
};

exports.resolvers = {
  Query: {
    accounts: () => Account.find().populate(['bills']),
    account: (_, { id }) => Account.findById(id).populate(['bills'])
  },
  Mutation: {
    createAccount,
    updateAccount,
    deleteAccount
  }
};
