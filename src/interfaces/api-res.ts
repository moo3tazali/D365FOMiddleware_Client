export interface ErrorRes {
  code: number;
  message: string;
  validationErrors: Record<string, string[]>;
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
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}
