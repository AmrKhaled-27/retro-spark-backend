export interface ApiResponse<T = any, M = any> {
  data?: T;
  message?: string;
  meta?: M;
  errors?: T;
}
