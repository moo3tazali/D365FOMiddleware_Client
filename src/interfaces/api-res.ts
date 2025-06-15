export interface ErrorRes {
  message: string;
  success: boolean;
  code: number;
  errors: string;
}

export interface SuccessRes<T> {
  message: string;
  success: boolean;
  code: number;
  error: string;
  data: T;
}

export interface PaginationRes<T> {
  items: T[];
  maxCount: number;
  skipCount: number;
}
