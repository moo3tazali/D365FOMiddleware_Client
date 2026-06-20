import type { TUser } from '@/interfaces/user';
import Cookies from 'universal-cookie';

export class User {
  private static _instance: User;
  private readonly _cookies: Cookies;
  private readonly _cookieId = 'dynamics_fo_user';
  private _user: TUser | null = null;

  private constructor() {
    this._cookies = new Cookies(null, {
      path: '/',
      secure: window.location.protocol === 'https:',
      httpOnly: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365 * 1, // 1 year
    });
  }

  // singleton pattern
  public static getInstance(): User {
    if (!User._instance) {
      User._instance = new User();
    }
    return User._instance;
  }

  public set(accessToken: string) {
    const tokenPayload = this.decodeAccessToken(accessToken);
    this._user = {
      email: tokenPayload.email ?? '',
      username:
        [tokenPayload.firstName, tokenPayload.lastName]
          .filter(Boolean)
          .join(' ') || (tokenPayload.email ?? '').split('@')[0],
      avatarPath: tokenPayload.avatarPath ?? '',
      role: tokenPayload.role,
      identityProvider: tokenPayload.identityProvider ?? 'ENTRA',
      accessStatus: tokenPayload.accessStatus,
      mustChangePassword: tokenPayload.mustChangePassword ?? false,
      firstName: tokenPayload.firstName,
      lastName: tokenPayload.lastName,
    };
    this._cookies.set(this._cookieId, this._user);
  }

  public get get(): TUser | null {
    if (!this._user) {
      const user = this._cookies.get<TUser | null>(this._cookieId);
      if (user) {
        this._user = user;
      } else {
        return null;
      }
    }

    return this._user;
  }

  public clear() {
    this._user = null;
    this._cookies.remove(this._cookieId);
  }

  private decodeAccessToken(accessToken: string): {
    role?: 'ADMIN' | 'OPS';
    avatarPath?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    identityProvider?: 'LOCAL' | 'ENTRA';
    accessStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
    mustChangePassword?: boolean;
  } {
    try {
      const encoded = accessToken.split('.')[1];
      return JSON.parse(
        decodeURIComponent(
          Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')))
            .map(
              (character) =>
                `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`,
            )
            .join(''),
        ),
      );
    } catch {
      return {};
    }
  }
}
