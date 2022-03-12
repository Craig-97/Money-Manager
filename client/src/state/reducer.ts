import { EVENTS } from '../constants';

export const reducer = (state: any, action: any) => {
  const { type, data } = action;
  switch (type) {
    case EVENTS.GET_ACCOUNT_DETAILS: {
      return {
        ...state,
        account: data
      };
    }
    default:
      return state;
  }
};
