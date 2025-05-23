import { Token } from './core/token';
import type { UserPayload } from '@/interfaces/user';

const tokenService = Token.getInstance();

export class User {
  private static _instance: User;

  private constructor() {}

  public static getInstance(): User {
    if (!User._instance) {
      User._instance = new User();
    }

    return User._instance;
  }

  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await tokenService.getToken();
      return !!token;
    } catch {
      return false;
    }
  }

  public async getUser(): Promise<UserPayload | null> {
    try {
      const token = await tokenService.getToken();

      if (!token) return null;

      return tokenService.decodeToken(token);
    } catch {
      return null;
    }
  }
}
