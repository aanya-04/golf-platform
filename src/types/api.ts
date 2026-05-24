export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type ApiError = {
  error: string;
  code: string;
};
