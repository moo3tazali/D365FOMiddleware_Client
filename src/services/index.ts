import { AccountReceivable } from './account-receivable';
import { Auth } from './auth';
import { DataBatch } from './data-batch';
import { User } from './user';

export const services = {
  authService: Auth.getInstance(),
  userService: User.getInstance(),
  accountReceivable: AccountReceivable.getInstance(),
  dataBatch: DataBatch.getInstance(),
} as const;

export type TServices = typeof services;
