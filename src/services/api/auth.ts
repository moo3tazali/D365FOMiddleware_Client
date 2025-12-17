import { Token } from '../core/token';
import { Sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { User } from '../core/user';
import type { TUser } from '@/interfaces/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

const syncService = Sync.getInstance({ public: true });
const tokenService = Token.getInstance();
const userService = User.getInstance();

export class Auth {
  private static _instance: Auth;

  private constructor() {}

  public static getInstance(): Auth {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }

    return Auth._instance;
  }

  public async login(data: LoginPayload): Promise<TUser> {
    try {
      const res = await syncService.save<AuthResponse, LoginPayload>(
        API_ROUTES.PUBLIC.AUTH.LOGIN,
        data
      );

      await tokenService.setToken(res);

      userService.set(data);

      return userService.get!;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public async refreshToken(): Promise<void> {
    try {
      const refreshToken = await tokenService.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await syncService.save<AuthResponse>(
        API_ROUTES.PUBLIC.AUTH.REFRESH,
        undefined,
        {
          headers: {
            'X-Refresh-Token': refreshToken,
          },
        }
      );

      await tokenService.setToken(res);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens if refresh fails
      await tokenService.clearToken();
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      const refreshToken = await tokenService.getRefreshToken();

      if (refreshToken) {
        await syncService.save<void>(API_ROUTES.PUBLIC.AUTH.LOGOUT, undefined, {
          headers: {
            'X-Refresh-Token': refreshToken,
          },
        });
      }

      await tokenService.clearToken();
      userService.clear();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  public async logoutAll(): Promise<void> {
    try {
      const accessToken = tokenService.getAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const tokenType = tokenService.getTokenType() ?? 'Bearer';

      await syncService.save<void>(
        API_ROUTES.PUBLIC.AUTH.LOGOUT_ALL,
        undefined,
        {
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        }
      );

      await tokenService.clearToken();
      userService.clear();
    } catch (error) {
      console.error('Logout all failed:', error);
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return tokenService.isAuthenticated();
  }

  public getCurrentUser() {
    return userService.get;
  }
}
