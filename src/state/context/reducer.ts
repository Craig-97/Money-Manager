import { initialState } from './account-context';
import { EVENTS } from '~/constants';
import { AccountContextState, Actions } from '~/types';

export const reducer = (state: AccountContextState, action: Actions): AccountContextState => {
  switch (action.type) {
    case EVENTS.GET_ACCOUNT_DETAILS: {
      return {
        ...state,
        account: action.data
      };
    }
    case EVENTS.LOGIN: {
      return {
        ...state,
        user: action.data
      };
    }
    case EVENTS.LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};
