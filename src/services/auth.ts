import { Token } from './core/token';
import { Sync } from './core/sync';
import { API_ROUTES } from './core/api-routes';

export interface LoginPayload {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

interface RefreshTokenPayload {
  refreshToken: string;
}

interface RefreshTokenResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

const syncService = Sync.getInstance({ public: true });
const tokenService = Token.getInstance();

export class Auth {
  private static _instance: Auth;

  private constructor() {}

  public static getInstance(): Auth {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }

    return Auth._instance;
  }

  public async login(data: LoginPayload): Promise<void> {
    try {
      const res = await syncService.save<LoginResponse, LoginPayload>(
        API_ROUTES.PUBLIC.IDENTITY.LOGIN,
        data
      );

      await tokenService.setToken(res);
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

      const refreshData: RefreshTokenPayload = { refreshToken };

      const res = await syncService.save<
        RefreshTokenResponse,
        RefreshTokenPayload
      >(API_ROUTES.PUBLIC.IDENTITY.REFRESH, refreshData);

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
      await tokenService.clearToken();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return tokenService.isAuthenticated();
  }

  public getCurrentUser() {
    return tokenService.getCurrentUser();
  }
}
