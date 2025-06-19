export interface TPaginationSearchQuery {
  maxCount?: number;
  skipCount?: number;
}

export interface ISearchQuery {
  search?: string;
}

export type QueryValue = string | number | boolean | string[] | number[];

export type RawFilter = {
  key: string;
  value: QueryValue;
};
