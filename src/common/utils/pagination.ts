import { PaginationParams, PaginationMeta } from '../types/pagination';

export function getPaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const search = query.search?.trim() || undefined;
  return { page, limit, search };
}

export function getPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  };
}

export function getSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}
