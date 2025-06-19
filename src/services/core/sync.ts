import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { serialize } from 'object-to-formdata';

import { Env, ENV } from './env';
import { Token } from './token';
import { ErrorHandler } from './error-handler';
import { ApiRoutes, type BuildUrlOptions } from './api-routes';
import type { SuccessRes } from '@/interfaces/api-res';

interface SyncOptions {
  public?: boolean;
}

interface GetRequestConfig extends AxiosRequestConfig {
  params?: BuildUrlOptions['params'];
  query?: BuildUrlOptions['query'];
}

interface PostRequestConfig extends GetRequestConfig {
  saveMethod?: 'post' | 'patch' | 'put';
  formData?: boolean;
}

interface DownloadConfig {
  params?: BuildUrlOptions['params'];
  query?: BuildUrlOptions['query'];
  downloadMethod?: 'get' | 'post';
}

type TUrl = BuildUrlOptions['url'];

export class Sync {
  private static _publicInstance: Sync;
  private static _privateInstance: Sync;
  private readonly _axiosInstance: AxiosInstance;
  private readonly _withAuth: boolean = false;
  private readonly _env = Env.getInstance();
  private readonly _token = Token.getInstance();
  private readonly _errorHandler = ErrorHandler.getInstance();
  private readonly _apiRoutes = ApiRoutes.getInstance();

  private constructor(isPublic: boolean) {
    this._axiosInstance = axios.create({
      baseURL: this._env.get(ENV.SERVER_BASE_URL),
    });

    if (!isPublic && this._withAuth) {
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
    config?: GetRequestConfig
  ): Promise<TRes> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    return this._handle<TRes>(() => this._axiosInstance.get(builtUrl, config));
  }

  public async download(
    url: TUrl,
    config?: DownloadConfig
  ): Promise<{ blob: Blob; fileName: string }> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    try {
      let res: AxiosResponse<Blob>;

      if (config && config?.downloadMethod) {
        const downloadMethod = config?.downloadMethod;
        res = await this._axiosInstance?.[downloadMethod](builtUrl, {
          responseType: 'blob',
        });
      } else {
        res = await this._axiosInstance.post(builtUrl, undefined, {
          responseType: 'blob',
        });
      }

      const fileName = await this._downloadFileFromResponse(res);

      return {
        blob: res.data,
        fileName,
      };
    } catch (error) {
      return this._errorHandler.throwError(error);
    }
  }

  public async save<TRes, TData>(
    url: TUrl,
    data?: TData,
    config?: PostRequestConfig
  ): Promise<TRes> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    const method = config?.saveMethod;

    const payload =
      config?.formData && data
        ? serialize(data, {
            indices: true,
            nullsAsUndefineds: true,
          })
        : data;

    if (!method) {
      return this._handle<TRes>(() =>
        this._axiosInstance.post(builtUrl, payload, config)
      );
    }

    return this._handle<TRes>(() =>
      this._axiosInstance[method](builtUrl, payload, config)
    );
  }

  public async del<TRes = void>(
    url: TUrl,
    config?: GetRequestConfig
  ): Promise<TRes> {
    const builtUrl = this._apiRoutes.build(url, {
      params: config?.params,
      query: config?.query,
    });

    return this._handle<TRes>(() =>
      this._axiosInstance.delete(builtUrl, config)
    );
  }

  private async _handle<T>(fn: () => Promise<T>): Promise<T> {
    try {
      const res = (await fn()) as AxiosResponse<SuccessRes<T>>;
      return res.data.data;
    } catch (error) {
      return this._errorHandler.throwError(error);
    }
  }

  private async _downloadFileFromResponse(
    response: AxiosResponse
  ): Promise<string> {
    let fileName: string = 'downloaded-file';
    const headers = response.headers;

    if (headers) {
      const contentDisposition = headers?.['content-disposition'] as
        | string
        | undefined;

      if (contentDisposition) {
        fileName = this._getFileNameFromHeader(contentDisposition) ?? fileName;
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return fileName;
  }

  private _getFileNameFromHeader(headerValue: string): string | null {
    const filenameStarMatch = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
    if (filenameStarMatch && filenameStarMatch[1]) {
      return decodeURIComponent(filenameStarMatch[1]);
    }

    const filenameMatch = headerValue.match(/filename="?([^"]+)"?/i);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1];
    }

    return null;
  }

  private _injectToken(): void {
    this._axiosInstance.interceptors.request.use(async (config) => {
      const token = await this._token.getToken();

      if (!token) {
        throw new Error('Failed to inject token, Token is missing!!');
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
}
