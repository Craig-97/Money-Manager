import { events } from '../constants';
import { getAccountData } from '../mockData';

export const reducer = (state: any, action: any) => {
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
