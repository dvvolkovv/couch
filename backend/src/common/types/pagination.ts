export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export function normalizePagination(params: PaginationParams): {
  cursor: string | undefined;
  limit: number;
} {
  return {
    cursor: params.cursor || undefined,
    limit: Math.min(Math.max(params.limit || DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT),
  };
}
