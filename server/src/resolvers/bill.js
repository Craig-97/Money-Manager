import { Bill } from '../models/Bill';
import { Account } from '../models/Account';

const createBill = async (_, { bill }) => {
  try {
    const newBill = new Bill(bill);
    await newBill.save().then(() => {
      // UPDATE ACCOUNT TO BILL ONE-TO-MANY LIST
      if (newBill.account) {
        Account.findOne({ _id: newBill.account }, (err, account) => {
          if (err) {
            throw err;
          }

          account.bills.push(newBill);
          account.save();
        });
      }
    });
    return { bill: newBill, success: true };
  } catch (err) {
    throw err;
  }
};

const updateBill = async (_, { id, bill }) => {
  const currentBill = await Bill.findById(id);
  const mergedBill = Object.assign(currentBill, bill);
  mergedBill.__v = mergedBill.__v + 1;

  try {
    const updatedBill = await Bill.findOneAndUpdate({ _id: id }, mergedBill, {
      new: true
    });
    return {
      bill: updatedBill,
      success: true
    };
  } catch (err) {
    throw err;
  }
};

const deleteBill = async (_, { id }) => {
  try {
    await Bill.deleteOne({ _id: id });
    return {
      success: true
    };
  } catch (err) {
    throw err;
  }
};

exports.resolvers = {
  Query: {
    bills: () => Bill.find(),
    bill: (_, { id }) => Bill.findById(id)
  },
  Mutation: {
    createBill,
    updateBill,
    deleteBill
  }
};
