export interface ApiResponse<T = unknown> {
  statusCode: number;
  timestamp: string;
  data?: T;
  message?: string;
  error?: string;
}
