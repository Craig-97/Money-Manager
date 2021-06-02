import mongoose from 'mongoose';

export const Account = mongoose.model('Account', {
  bankBalance: Number,
  monthlyIncome: Number,
  bankPaydayTotal: Number
});
