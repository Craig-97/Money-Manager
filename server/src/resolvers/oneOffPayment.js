import { OneOffPayment } from '../models/OneOffPayment';
import { Account } from '../models/Account';

const createOneOffPayment = async (_, { oneOffPayment }) => {
  try {
    const newOneOffPayment = new OneOffPayment(oneOffPayment);
    await newOneOffPayment.save().then(() => {
      // UPDATE ACCOUNT TO ONEOFFPAYMENTS ONE-TO-MANY LIST
      if (newOneOffPayment.account) {
        Account.findOne({ _id: newOneOffPayment.account }, (err, account) => {
          if (err) {
            throw err;
          }

          account.oneOffPayments.push(newOneOffPayment);
          account.save();
        });
      }
    });
    return { oneOffPayment: newOneOffPayment, success: true };
  } catch (err) {
    throw err;
  }
};

const editOneOffPayment = async (_, { id, oneOffPayment }) => {
  const currentOneOffPayment = await OneOffPayment.findById(id);
  const mergedOneOffPayment = Object.assign(
    currentOneOffPayment,
    oneOffPayment
  );
  mergedOneOffPayment.__v = mergedOneOffPayment.__v + 1;

  try {
    const editdOneOffPayment = await OneOffPayment.findOneAndUpdate(
      { _id: id },
      mergedOneOffPayment,
      {
        new: true
      }
    );
    return {
      oneOffPayment: editdOneOffPayment,
      success: true
    };
  } catch (err) {
    throw err;
  }
};

const deleteOneOffPayment = async (_, { id }) => {
  try {
    await OneOffPayment.deleteOne({ _id: id });
    return {
      success: true
    };
  } catch (err) {
    throw err;
  }
};

exports.resolvers = {
  Query: {
    oneOffPayments: () => OneOffPayment.find().sort({ amount: 1 }),
    oneOffPayment: (_, { id }) => OneOffPayment.findById(id)
  },
  Mutation: {
    createOneOffPayment,
    editOneOffPayment,
    deleteOneOffPayment
  }
};
