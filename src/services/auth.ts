import type { UserPayload } from '@/interfaces/user';
import { Token } from './core/token';
import { Sync } from './core/sync';
import { API_ROUTES } from './core/api-routes';

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
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

  public async login(
    data: LoginData
  ): Promise<UserPayload> {
    const { accessToken } = await syncService.save<
      AuthResponse,
      LoginData
    >(API_ROUTES.AUTH.LOGIN, data);

    tokenService.setToken(accessToken);

    return tokenService.decodeToken(accessToken);
  }

  public async logout(): Promise<void> {
    await tokenService.clearToken();
  }
}
