/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      limit: number;
      offset: number;
      total?: number;
    };
    [key: string]: any;
  };
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Health check response
 */
export interface HealthCheck {
  ok: boolean;
  service: string;
  timestamp: string;
  environment?: string;
  supabase?: {
    connected: boolean;
  };
  firebase?: {
    configured: boolean;
  };
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Pagination metadata in responses
 */
export interface PaginationMeta {
  limit: number;
  offset: number;
  total?: number;
}
