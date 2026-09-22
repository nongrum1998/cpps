/**
 * @pension/api — shared API contracts for the workspace.
 *
 * Skeleton package. Intended to hold endpoint request/response schemas and
 * base URL configuration shared between the mobile app and any future
 * backend tooling. Exports are minimal until the contracts are extracted.
 */

import { AxiosInstance, AxiosInterceptorOptions } from 'axios';
import { createApiClient } from './client';
import { createAuthService } from './services/auth.service';
import { createHttp } from './http';

export interface ApiInterceptors {
  request?: Array<{
    onFulfilled?: Parameters<AxiosInstance['interceptors']['request']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['request']['use']>[1];
    options?: AxiosInterceptorOptions;
  }>;

  response?: Array<{
    onFulfilled?: Parameters<AxiosInstance['interceptors']['response']['use']>[0];
    onRejected?: Parameters<AxiosInstance['interceptors']['response']['use']>[1];
    options?: AxiosInterceptorOptions;
  }>;
}

export interface ApiConfig {
  baseURL: string;
  interceptors?: ApiInterceptors;
}

export function createApi(config: ApiConfig) {
  const client = createApiClient({
    baseURL: config.baseURL,
    timeout: 30_000,
  });

  for (const interceptor of config.interceptors?.request ?? []) {
    client.interceptors.request.use(
      interceptor.onFulfilled,
      interceptor.onRejected,
      interceptor.options
    );
  }

  for (const interceptor of config.interceptors?.response ?? []) {
    client.interceptors.response.use(interceptor.onFulfilled, interceptor.onRejected);
  }

  const http = createHttp(client);

  return {
    client,
    http: http,
    auth: createAuthService(client),
  };
}
