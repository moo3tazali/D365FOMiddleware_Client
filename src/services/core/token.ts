import { set, get, del } from 'idb-keyval';
import Cookies from 'universal-cookie';

export interface IToken {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

interface IRefreshTokenData {
  refreshToken: string;
  tokenType: string;
}

export class Token {
  private static _instance: Token;
  private readonly _cookies: Cookies;
  private readonly _refreshTokenId = 'refreshToken';
  private readonly _accessTokenCookieName = 'access_token';
  private readonly _tokenTypeCookieName = 'token_type';

  private constructor() {
    this._cookies = new Cookies(null, {
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'strict',
    });
  }

  // singleton pattern
  public static getInstance(): Token {
    if (!Token._instance) {
      Token._instance = new Token();
    }
    return Token._instance;
  }

  // save tokens using dual storage strategy
  public async setToken(token: IToken): Promise<void> {
    try {
      // Store access token in cookie with expiration
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + token.expiresIn);

      this._setAccessTokenCookie(token.accessToken, expirationDate);
      this._setTokenTypeCookie(token.tokenType, expirationDate);

      // Store refresh token in IndexedDB
      await this._setRefreshToken({
        refreshToken: token.refreshToken,
        tokenType: token.tokenType,
      });
    } catch (error) {
      console.error('Error saving token', error);
      throw error;
    }
  }

  // get access token from cookie
  public getAccessToken(): string | null {
    return this._cookies.get(this._accessTokenCookieName);
  }

  // get token type from cookie
  public getTokenType(): string | null {
    return this._cookies.get(this._tokenTypeCookieName);
  }

  // get refresh token from IndexedDB
  public async getRefreshToken(): Promise<string | null> {
    try {
      const tokenData = await this._getRefreshTokenData();
      return tokenData?.refreshToken || null;
    } catch (error) {
      console.error('Error getting refresh token', error);
      return null;
    }
  }

  // check if user is authenticated (has valid access token)
  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  // clear all tokens
  public async clearToken(): Promise<void> {
    try {
      // Clear cookies
      this._cookies.remove(this._accessTokenCookieName);
      this._cookies.remove(this._tokenTypeCookieName);

      // Clear refresh token from IndexedDB
      await this._clearRefreshToken();
    } catch (error) {
      console.error('Error clearing tokens', error);
      throw error;
    }
  }

  // decode token to get user info payload
  public decodeToken<T>(token: string): T {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded as T;
    } catch {
      throw new Error('Error decoding token');
    }
  }

  // Private helper methods for cookie management
  private _setAccessTokenCookie(token: string, expiresIn: Date): void {
    this._cookies.set(this._accessTokenCookieName, token, {
      expires: expiresIn,
    });
  }

  private _setTokenTypeCookie(tokenType: string, expiresIn: Date): void {
    // Token type doesn't need expiration as it's tied to access token
    this._cookies.set(this._tokenTypeCookieName, tokenType, {
      expires: expiresIn,
    });
  }

  // Private helper methods for IndexedDB operations
  private async _setRefreshToken(tokenData: IRefreshTokenData): Promise<void> {
    await set(this._refreshTokenId, tokenData);
  }

  private async _getRefreshTokenData(): Promise<IRefreshTokenData | undefined> {
    const result = await get<IRefreshTokenData>(this._refreshTokenId);
    return result;
  }

  private async _clearRefreshToken(): Promise<void> {
    await del(this._refreshTokenId);
  }
}
