import { Token } from '../core/token';
import { Sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { User } from '../core/user';
import { Env, ENV } from '../core/env';
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

export interface AccessStatusResponse {
  accessStatus?: TUser['accessStatus'];
  role?: TUser['role'];
  mustChangePassword: boolean;
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
        data,
      );

      await tokenService.setToken(res);

      userService.set(res.accessToken);

      return userService.get!;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public startMicrosoftLogin(returnPath = '/'): void {
    const apiUrl = Env.getInstance().get(ENV.NEST_SERVER_BASE_URL);
    const url = new URL(
      `${apiUrl}${API_ROUTES.PUBLIC.AUTH.MICROSOFT}`,
      window.location.origin,
    );
    url.searchParams.set('returnPath', returnPath);
    window.location.assign(url.toString());
  }

  public async exchangeMicrosoftCode(code: string): Promise<TUser> {
    const res = await syncService.save<AuthResponse, { code: string }>(
      API_ROUTES.PUBLIC.AUTH.MICROSOFT_EXCHANGE,
      { code },
    );
    await tokenService.setToken(res);
    userService.set(res.accessToken);
    return userService.get!;
  }

  public async getAccessStatus(): Promise<AccessStatusResponse> {
    return Sync.getInstance().fetch<AccessStatusResponse>(
      API_ROUTES.PUBLIC.AUTH.ACCESS_STATUS,
    );
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
        },
      );

      await tokenService.setToken(res);
      userService.set(res.accessToken);
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
    } finally {
      await tokenService.clearToken();
      userService.clear();
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
        },
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
