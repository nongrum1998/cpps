import axios, { type AxiosInstance } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 30_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}
