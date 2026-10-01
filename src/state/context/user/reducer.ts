import { initialUserState } from './UserContext';
import { EVENTS } from '~/constants';
import { User, Actions } from '~/types';

export const reducer = (state: User, action: Actions): User => {
  switch (action.type) {
    case EVENTS.LOGIN:
      return action.data;
    case EVENTS.LOGOUT:
      return initialUserState;
    default:
      return state;
  }
};
