export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  surname?: string;
}

export interface FindUserData {
  tokenFindUser: User;
}

export interface LoginData {
  login: LoginResponse;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  tokenExpiration?: number;
}
