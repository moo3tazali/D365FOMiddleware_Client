import { AxiosError } from 'axios';

import type { ErrorRes } from '@/interfaces/api-res';

export class ErrorHandler {
  private static _instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!this._instance) {
      this._instance = new ErrorHandler();
    }

    return this._instance;
  }

  public throwError(error: unknown): never {
    const appError = this._handleError(error);

    if (import.meta.env.DEV) {
      console.error(appError);
    }

    throw appError;
  }

  public getError(error: unknown): ErrorRes {
    return this._handleError(error);
  }

  private _handleError(error: unknown): ErrorRes {
    if (error instanceof AxiosError) {
      return this._handleAxiosError(error);
    }

    return this._handleGenericError(error);
  }

  private _handleAxiosError(error: AxiosError): ErrorRes {
    if (error.response) {
      return error.response.data as ErrorRes;
    }

    if (error.request) {
      return {
        code: 0,
        success: false,
        message: 'Network Error',
        errors:
          'Network Error: Unable to connect to server.',
      };
    }

    return {
      code: 0,
      success: false,
      message: `Request Error`,
      errors: error.message,
    };
  }

  private _handleGenericError(error: unknown): ErrorRes {
    if (error instanceof Error) {
      return {
        code: 0,
        success: false,
        message: `Expected Error`,
        errors: error.message,
      };
    }

    return {
      code: 0,
      success: false,
      message: 'Unknown Error',
      errors: '',
    };
  }
}
