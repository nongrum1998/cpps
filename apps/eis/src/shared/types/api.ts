// import { MetaT } from './meta';

/**
 * Standard API Response structure for all requests.
 * Used across http utility.
 */
import { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface HttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;

  post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;

  put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}
