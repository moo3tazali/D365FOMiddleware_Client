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
      const err = error.response?.data;

      if (this._isServerError(err)) {
        return {
          code: 500,
          message: `Unknown Server Error: ${JSON.stringify(err.title)}`,
          validationErrors: {},
        };
      }

      if (this._isErrorResOne(err)) {
        return {
          code: err.code,
          message: err.message,
          validationErrors: err.errors,
        };
      }

      if (this._isErrorResTwo(err)) {
        return {
          code: err.status,
          message: err.title,
          validationErrors: err.errors,
        };
      }

      return this._defaultError(
        `Unexpected response structure: ${error.message}`,
        error.response.status
      );
    }

    if (error.request) {
      return this._defaultError('Network Error: Unable to connect to server.');
    }

    return this._defaultError(`Request Error: ${error.message}`);
  }

  private _handleGenericError(error: unknown): ErrorRes {
    if (error instanceof Error) {
      return {
        code: 0,
        message: `Expected Error: ${JSON.stringify(error.message)}`,
        validationErrors: {},
      };
    }

    return this._defaultError('Unknown Error');
  }

  private _defaultError(message: string, code = 0): ErrorRes {
    return {
      code,
      message,
      validationErrors: {},
    };
  }

  private _isErrorResOne(data: unknown): data is {
    code: number;
    message: string;
    errors: Record<string, string[]>;
  } {
    return (
      !!data &&
      typeof data === 'object' &&
      'code' in data &&
      'success' in data &&
      'message' in data &&
      'errors' in data
    );
  }

  private _isErrorResTwo(data: unknown): data is {
    status: number;
    title: string;
    errors: Record<string, string[]>;
  } {
    return (
      !!data &&
      typeof data === 'object' &&
      'status' in data &&
      'title' in data &&
      'errors' in data
    );
  }

  private _isServerError(
    data: unknown
  ): data is { status: 500; title: string } {
    return (
      !!data &&
      typeof data === 'object' &&
      'status' in data &&
      data.status === 500 &&
      'title' in data
    );
  }
}
