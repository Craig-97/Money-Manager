import { EVENTS } from '~/types';
import { AccountContextState, AccountState, Actions } from '~/types';
import { initialState } from './account-context';

export const reducer = (state: AccountContextState, action: Actions): AccountContextState => {
  const { type, data } = action;
  switch (type) {
    case EVENTS.GET_ACCOUNT_DETAILS: {
      return {
        ...state,
        account: data as AccountState
      };
    }
    case EVENTS.LOGIN: {
      return {
        ...state,
        user: { ...data }
      };
    }
    case EVENTS.LOGOUT: {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
