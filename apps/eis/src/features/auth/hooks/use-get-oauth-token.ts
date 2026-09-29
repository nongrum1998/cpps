import { useQuery } from '@tanstack/react-query';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '@utils/logger';
import RNFetchBlob from 'rn-fetch-blob';
import { QUERY_KEYS } from '@utils/constants';
import { env } from '@utils/env';

const BASIC_AUTH_TOKEN = env.EXPO_PUBLIC_BASIC_AUTH;

const API_URL = env.EXPO_PUBLIC_API_OAUTH_URL;

const url = `${API_URL}/oauth2/token`;

const headers = {
  Authorization: `Basic ${BASIC_AUTH_TOKEN}`,
  'Content-Type': 'application/x-www-form-urlencoded',
};

type GetOAuthResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

/**
 * Fetches an OAuth2 bearer token via the client-credentials grant and stores
 * it in SecureStore for subsequent API calls.
 *
 * Uses `useQuery` with `enabled: false` so the caller controls when the fetch
 * starts (e.g., on screen mount). The result is cached for 5 minutes to avoid
 * redundant fetches if the component remounts.
 *
 * @returns A query result with `refetch` to trigger the fetch, `isLoading`
 *   while in-flight, `isSuccess` when a token has been stored, and
 *   `isError`/`error` on failure.
 */
export function useGetOAuthToken() {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.OAUTH_TOKEN,
    queryFn: async () => {
      const res = await RNFetchBlob.config({ trusty: true }).fetch(
        'POST',
        url,
        headers,
        'grant_type=client_credentials'
      );

      const data = JSON.parse(res.data) as GetOAuthResponse;

      if (!data || !data.access_token) {
        throw new Error('OAuth response missing access_token');
      }

      logger.info('Get OAuth Token Success', { accessToken: !!data.access_token });
      await TokenStoreManager.addAccessToken(data.access_token);
      logger.info('Successfully set access token');

      return data;
    },
    // Don't auto-fetch — the screen triggers it via refetch() on mount
    enabled: false,
    retry: true,
    staleTime: 1000 * 60 * 5,
  });
}
