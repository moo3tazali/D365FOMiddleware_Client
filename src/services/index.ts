import { Auth } from './auth';
import { User } from './user';

export const services = {
  authService: Auth.getInstance(),
  userService: User.getInstance(),
} as const;

export type TServices = typeof services;
