import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { Env, ENV } from './env';
import { Token } from './token';
import { ErrorHandler } from './error-handler';
import {
  ApiRoutes,
  type BuildUrlOptions,
} from './api-routes';
import type { SuccessRes } from '@/interfaces/api-res';

interface SyncOptions {
  public?: boolean;
}

interface RequestConfig extends AxiosRequestConfig {
  params?: BuildUrlOptions['params'];
  query?: BuildUrlOptions['query'];
  saveMethod?: 'post' | 'patch' | 'put';
}

type TUrl = BuildUrlOptions['url'];

export class Sync {
  private static _publicInstance: Sync;
  private static _privateInstance: Sync;
  private readonly _axiosInstance: AxiosInstance;
  private readonly _env = Env.getInstance();
  private readonly _token = Token.getInstance();
  private readonly _errorHandler =
    ErrorHandler.getInstance();
  private readonly _apiRoutes = ApiRoutes.getInstance();

  private constructor(isPublic: boolean) {
    this._axiosInstance = axios.create({
      baseURL: this._env.get(ENV.SERVER_BASE_URL),
    });

    if (!isPublic) {
      this._injectToken();
    }
  }

  public static getInstance(opt?: SyncOptions): Sync {
    const isPublic = opt?.public ?? false;
    if (isPublic) {
      if (!this._publicInstance) {
        this._publicInstance = new Sync(true);
      }
      return this._publicInstance;
    } else {
      if (!this._privateInstance) {
        this._privateInstance = new Sync(false);
      }
      return this._privateInstance;
    }
  }

  public async fetch<TRes>(
    url: TUrl,
    config?: RequestConfig
  ): Promise<TRes> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    const res = await this._handle<SuccessRes<TRes>>(() =>
      this._axiosInstance.get(builtUrl, config)
    );

    return res.data;
  }

  public async save<TRes, TData>(
    url: TUrl,
    data: TData,
    config?: RequestConfig
  ): Promise<TRes> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    const method = config?.saveMethod;

    if (!method) {
      const res = await this._handle<SuccessRes<TRes>>(() =>
        this._axiosInstance.post(builtUrl, data, config)
      );

      return res.data;
    }

    const res = await this._handle<SuccessRes<TRes>>(() =>
      this._axiosInstance[method](builtUrl, data, config)
    );

    return res.data;
  }

  public async del(
    url: TUrl,
    config?: RequestConfig
  ): Promise<void> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    return this._handle<void>(() =>
      this._axiosInstance.delete(builtUrl, config)
    );
  }

  private async _handle<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const res = (await fn()) as AxiosResponse<T>;
      return res.data;
    } catch (error) {
      return this._errorHandler.throwError(error);
    }
  }

  private _injectToken(): void {
    this._axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this._token.getToken();

        if (!token) {
          throw new Error(
            'Failed to inject token, Token is missing!!'
          );
        }
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    );
  }
}
