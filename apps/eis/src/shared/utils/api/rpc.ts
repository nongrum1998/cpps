import { METHODS } from '@utils/constants';
import { ApiResponse } from '@sharedTypes/api';
import { http } from './http';

/**
 * Payload shape for an RPC request sent to the `/make_request` endpoint.
 *
 * @typeParam TParams - The type of the method-specific parameters.
 */
export type RpcRequest<TParams = unknown> = {
  /** The RPC method identifier. */
  method: METHODS;
  /** Optional method-specific parameters. */
  params?: TParams;
};

/**
 * Calls a backend function via the generic RPC `/make_request` endpoint.
 *
 * Sends a POST request with the function name and additional parameters,
 * returning a normalized API response.
 *
 * @typeParam TResult - The expected shape of the response data.
 * @typeParam TParams - The shape of the method-specific parameters.
 * @param functionName - The name of the backend function to invoke.
 * @param params - Additional parameters forwarded alongside the function name.
 * @returns A promise resolving to the normalized API response.
 *
 * @example
 * ```ts
 * const res = await rpc<Employee>('get_employee_details', { id: '42' });
 * ```
 */
export const rpc = async <TResult, TParams = unknown>(
  functionName: string,
  params?: TParams
): Promise<ApiResponse<TResult>> => {
  const endpoint: string = '/make_request';
  return http.post<TResult>(endpoint, {
    functionName,
    ...params,
  });
};
