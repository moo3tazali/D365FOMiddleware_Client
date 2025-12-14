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

    return this._handleThrownError(error);
  }

  private _handleAxiosError(error: AxiosError): ErrorRes {
    if (error.response) {
      const err = error.response.data;
      const status = error.response.status;

      // fallback to generic message based on status
      const override = this._getDefaultErrorForStatus(status);

      if (override) return override;

      // check for ErrorResOne / Two
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

      if (this._isErrorResThree(err)) {
        return {
          code: err.status.code,
          message: err.status.developerMessage,
          validationErrors: err.status?.validationErrors ?? {},
        };
      }

      // ✅ 4. fallback to generic message based on status
      return this._defaultError(
        `Unexpected Response Error: ${error.message}.`,
        status
      );
    }

    if (error.request) {
      return this._defaultError('Network Error: Unable to connect to server.');
    }

    return this._defaultError(`Unknown Request Error: ${error.message}`);
  }

  private _getDefaultErrorForStatus(status: number): ErrorRes | null {
    switch (status) {
      case 401:
        return this._defaultError('Unauthorized: Please log in again.', 401);
      case 403:
        return this._defaultError(
          'Forbidden: You do not have permission to access this resource.',
          403
        );
      case 404:
        return this._defaultError(
          'Not Found: The requested resource could not be found.',
          404
        );
      case 500:
        return this._defaultError(
          'Something went wrong on our side. Please try again later.',
          500
        );
      case 429:
        return this._defaultError(
          'Too many requests. Please try again later.',
          429
        );
      case 503:
        return this._defaultError(
          'Service is temporarily unavailable. Please try again later.',
          503
        );
      default:
        return null;
    }
  }

  private _handleThrownError(error: unknown): ErrorRes {
    if (error instanceof Error) {
      return {
        code: 0,
        message: `Expected Error: ${error.message}`,
        validationErrors: {},
      };
    }

    return this._defaultError(`Unknown Error ${JSON.stringify(error)}`);
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

  private _isErrorResThree(data: unknown): data is {
    status: {
      code: number;
      userMessage: string;
      developerMessage: string;
      errorCode: string;
      validationErrors?: Record<string, string[]>;
    };
    meta: {
      requestId: string;
      timestamp: string;
      path: string;
      method: string;
    };
  } {
    return (
      !!data &&
      typeof data === 'object' &&
      'status' in data &&
      'meta' in data &&
      typeof (data as { status: unknown }).status === 'object' &&
      (data as { status: { code?: unknown; userMessage?: unknown } }).status !==
        null &&
      'code' in (data as { status: { code: unknown } }).status &&
      'userMessage' in (data as { status: { userMessage: unknown } }).status
    );
  }
}
