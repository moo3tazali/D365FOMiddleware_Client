import { AxiosError } from 'axios';

import type { ErrorRes } from '@/interfaces/api-res';

type AppError = ErrorRes['status'];

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

  public getError(error: unknown): AppError {
    return this._handleError(error);
  }

  private _handleError(error: unknown): AppError {
    if (error instanceof AxiosError) {
      return this._handleAxiosError(error);
    }

    return this._handleGenericError(error);
  }

  private _handleAxiosError(error: AxiosError): AppError {
    if (error.response) {
      const err = error.response.data as ErrorRes;
      return {
        ...err.status,
      };
    }

    if (error.request) {
      return {
        code: 0,
        message:
          'Network Error: Unable to connect to server.',
        error: true,
        validationsErrors: null,
      };
    }

    return {
      code: 0,
      message: `Request Error: ${error.message}`,
      error: true,
      validationsErrors: null,
    };
  }

  private _handleGenericError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        code: 0,
        message: error.message,
        error: true,
        validationsErrors: null,
      };
    }

    return {
      code: 0,
      message: 'Unknown error occurred.',
      error: true,
      validationsErrors: null,
    };
  }
}
