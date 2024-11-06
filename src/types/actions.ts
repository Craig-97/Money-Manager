import { EVENTS } from '~/constants';
import { AccountState } from './account';
import { User } from './user';

export type GetAccountDetailsAction = {
  type: typeof EVENTS.GET_ACCOUNT_DETAILS;
  data: AccountState;
};

export type LoginAction = {
  type: typeof EVENTS.LOGIN;
  data: User;
};

export type LogoutAction = {
  type: typeof EVENTS.LOGOUT;
};

// Combine into a discriminated union
export type Actions = GetAccountDetailsAction | LoginAction | LogoutAction;
