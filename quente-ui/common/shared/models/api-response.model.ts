export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
}
