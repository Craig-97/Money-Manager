import {
  getNewBillAdded,
  getNewOneOffPaymentAdded
} from './../utils/selectors';
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

    case events.CREATE_NEW_BILL: {
      let account = getAccountData(getNewBillAdded(state.account, data));

      return {
        ...state,
        account
      };
    }

    case events.CREATE_NEW_ONE_OFF_PAYMENT: {
      const account = getAccountData(
        getNewOneOffPaymentAdded(state.account, data)
      );

      return {
        ...state,
        account
      };
    }
    default:
      return state;
  }
};
