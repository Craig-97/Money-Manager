import {
  getNewBillAdded,
  getNewOneOffPaymentAdded,
  getOneOffPaymentDeleted,
  getBillDeleted
} from './../utils/selectors';
import { EVENTS } from '../constants';
import { getAccountData } from '../mockData';

export const reducer = (state: any, action: any) => {
  const { type, data } = action;
  switch (type) {
    case EVENTS.GET_ACCOUNT_DETAILS: {
      const account = getAccountData(data?.account);
      return {
        ...state,
        account
      };
    }
    case EVENTS.CREATE_NEW_BILL: {
      const account = getAccountData(getNewBillAdded(state.account, data));
      return {
        ...state,
        account
      };
    }
    case EVENTS.DELETE_BILL: {
      const account = getAccountData(getBillDeleted(state.account, data));
      return {
        ...state,
        account
      };
    }
    case EVENTS.DELETE_ONE_OFF_PAYMENT: {
      const account = getAccountData(
        getOneOffPaymentDeleted(state.account, data)
      );
      return {
        ...state,
        account
      };
    }
    case EVENTS.CREATE_NEW_ONE_OFF_PAYMENT: {
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
