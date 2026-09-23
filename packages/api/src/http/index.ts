import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleResponse } from './handle-res';
import { ApiResponse } from '@pension/types';

export function createHttp(client: AxiosInstance) {
  const request = async <T>(executor: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> => {
    return handleResponse<T>(await executor());
  };

  return {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.get<T>(url, config)),

    post: <T>(
      url: string,
      data?: object | string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => request(() => client.post<T>(url, data, config)),

    put: <T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.put<T>(url, data, config)),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
      request(() => client.delete<T>(url, config)),
  };
}
