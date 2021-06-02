import { events } from '../constants';
import { getAccountData } from '../mockData/accountData';

export const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case events.GET_ACCOUNT_DETAILS: {
      const account = getAccountData(data?.account);
      return {
        ...state,
        account
      };
    }
    default:
      return state;
  }
};
