import { AccountState } from './account';
import { User } from './user';

export interface Actions {
  type: string;
  data?: AccountState | User;
}
