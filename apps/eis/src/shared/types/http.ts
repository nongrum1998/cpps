export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type HeadersMap = Record<string, string>;

// Unified internal response shape to handle both fetch and ssl-pinning
export interface InternalResponse {
  status: number;
  body: string;
  headers: HeadersMap;
}
