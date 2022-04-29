export interface User {
  id?: string;
  email?: string;
}

export interface FindUserData {
  tokenFindUser: User;
}

export interface LoginData {
  login: LoginResponse;
}

export interface LoginResponse {
  userId?: string;
  token?: string;
  tokenExpiration?: number;
}
