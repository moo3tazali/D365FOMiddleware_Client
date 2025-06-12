import { AccountReceivable } from './account-receivable';
import { Auth } from './auth';
import { User } from './user';

export const services = {
  authService: Auth.getInstance(),
  userService: User.getInstance(),
  accountReceivable: AccountReceivable.getInstance(),
} as const;

export type TServices = typeof services;
