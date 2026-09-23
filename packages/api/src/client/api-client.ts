import axios, { type AxiosInstance } from 'axios';
import { ApiClientConfig } from '@pension/types';

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
