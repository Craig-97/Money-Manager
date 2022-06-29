export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  surname?: string;
}

export interface UserData {
  user: User;
}

export interface FindUserData {
  tokenFindUser: User;
}

export interface LoginData {
  login: LoginResponse;
}

export interface RegisterData {
  registerAndLogin: LoginResponse;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  tokenExpiration?: number;
}
