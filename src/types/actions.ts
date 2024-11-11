import { User } from './user';
import { EVENTS } from '~/constants';

export type LoginAction = {
  type: typeof EVENTS.LOGIN;
  data: User;
};

export type LogoutAction = {
  type: typeof EVENTS.LOGOUT;
};

// Combine into a discriminated union
export type Actions = LoginAction | LogoutAction;
