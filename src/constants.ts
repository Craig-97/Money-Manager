export enum TYPES {
  BILL = 'Bill',
  ONEOFFPAYMENT = 'OneOffPayment'
}

export enum EVENTS {
  GET_ACCOUNT_DETAILS = 'GET_ACCOUNT_DETAILS',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum PAGES {
  HOMEPAGE = 'Homepage',
  NOTES = 'Notes',
  FORECAST = 'Forecast'
}

export const ERRORS = {
  USER_EXISTS: 'User with email already exists',
  ACCOUNT_NOT_FOUND: 'User does not have a linked account',
  USER_NOT_FOUND: 'User does not exist',
  EMAIL_NOT_FOUND: 'Email address does not exist',
  INCORRECT_PASSWORD: 'Password is incorrect'
};
