import { PaginationMeta } from './pagination';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  warning?: boolean;
  warningMessage?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, ...(meta && { meta }) };
}

export function warningResponse<T>(data: T, warningMessage: string, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, warning: true, warningMessage, ...(meta && { meta }) };
}

export function errorResponse(code: string, message: string, details?: any): ApiResponse {
  return { success: false, error: { code, message, ...(details && { details }) } };
}
