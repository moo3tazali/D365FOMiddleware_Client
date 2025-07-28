import Dexie from 'dexie';
import { decodeJwt } from 'jose';

import type { UserPayload } from '@/interfaces/user';

interface IToken {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export class Token {
  private static _instance: Token;
  private readonly _db: Dexie;
  private readonly _tableName = 'tokens';
  private readonly _tokenId = 'authToken';

  private constructor() {
    this._db = new Dexie('TasksDB');
    this._db.version(1).stores({
      tokens: 'id, value',
    });
  }

  // singleton pattern
  public static getInstance(): Token {
    if (!Token._instance) {
      Token._instance = new Token();
    }
    return Token._instance;
  }

  // save encrypted token to indexedDB
  public async setToken(token: IToken) {
    try {
      await this._db
        .table(this._tableName)
        .put({ id: this._tokenId, value: token });
    } catch (error) {
      console.error('Error saving token', error);
    }
  }

  // get decrypted token from indexedDB
  public async getToken(): Promise<IToken | undefined> {
    try {
      const token = (await this._db.table(this._tableName).get(this._tokenId))
        ?.value as IToken | undefined;

      if (!token) return;

      return token;
    } catch (error) {
      console.error('Error getting token', error);
    }
  }

  // delete token from indexedDB
  public async clearToken(): Promise<void> {
    try {
      await this._db.table(this._tableName).delete(this._tokenId);
    } catch (error) {
      console.error('Error clearing token', error);
    }
  }

  // decode token to get user info payload
  public decodeToken(token: string): UserPayload {
    try {
      const payload = decodeJwt<UserPayload>(token);

      return {
        id: payload.sub ?? '',
        username: payload.username,
        email: payload.email,
        avatarPath: payload.avatarPath,
        roles: payload.roles,
      };
    } catch {
      throw new Error('Error decoding token');
    }
  }
}
