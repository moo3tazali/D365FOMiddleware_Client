export interface ErrorRes {
  status: {
    code: number;
    message: string;
    error: true;
    validationsErrors: {
      [key: string]: string[];
    } | null;
  };
  data: null;
}

export interface SuccessRes<T> {
  status: {
    code: number;
    message: string;
    error: false;
    validationsErrors: null;
  };
  data: T;
}

export interface PaginationRes<T> {
  items: T[];
  meta: {
    count: number;
    skip: number;
    limit: number;
  };
}
