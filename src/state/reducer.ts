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
    case EVENTS.LOGIN: {
      return {
        ...state,
        user: { ...data }
      };
    }
    default:
      return state;
  }
};
