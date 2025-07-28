import { Token } from './core/token';
import { Sync } from './core/sync';
import { API_ROUTES } from './core/api-routes';

interface LoginData {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

interface AuthResponse {
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

  public async login(data: LoginData): Promise<void> {
    const res = await syncService.save<AuthResponse, LoginData>(
      API_ROUTES.AUTH.LOGIN,
      data
    );

    await tokenService.setToken(res);
  }

  public async logout(): Promise<void> {
    await tokenService.clearToken();
  }
}
