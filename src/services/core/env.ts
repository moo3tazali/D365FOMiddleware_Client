export enum ENV {
  SERVER_BASE_URL = 'serverBaseUrl',
  Client_BASE_URL = 'clientBaseUrl',
}

export class Env {
  private static _instance: Env;

  private readonly _env = {
    [ENV.SERVER_BASE_URL]: 'VITE_SERVER_BASE_URL',
    [ENV.Client_BASE_URL]: 'VITE_CLIENT_BASE_URL',
  } as const;

  private constructor() {}

  // singleton pattern
  public static getInstance(): Env {
    if (!Env._instance) {
      Env._instance = new Env();
    }
    return Env._instance;
  }

  public get<K extends keyof typeof this._env>(
    key: K
  ): string;

  public get<K extends keyof typeof this._env>(
    ...keys: K[]
  ): { [P in K]: string };

  public get<K extends keyof typeof this._env>(
    ...keys: K[]
  ): { [P in K]: string } | string {
    const obj = keys.reduce((acc, key) => {
      const envKey = this._env[key];
      return {
        ...acc,
        [key]: this._getEnvValue(envKey),
      };
    }, {} as { [P in K]: string });

    return keys.length === 1 ? obj[keys[0]] : obj;
  }

  private _getEnvValue(key: string): string {
    const value = import.meta.env?.[key] as
      | string
      | undefined;

    if (!value) {
      throw new Error(
        `Missing environment variable: ${key}`
      );
    }

    return value;
  }
}
