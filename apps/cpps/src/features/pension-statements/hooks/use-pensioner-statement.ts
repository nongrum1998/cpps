import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http';
import { PensionStatementResponseI } from '../types';
import { ENDPOINTS } from '@utils/constants';
import { encryptText } from '@lib/encryption';
import { TokenStoreManager } from '@stores/token.store';

/**
 * Fetches the current user's six-month pension statements.
 *
 * Reads the authenticated user's PPO number from the auth store, encrypts it,
 * and posts it to the PENSIONER_STATEMENTS.SIX_MONTH_STATEMENTS endpoint using
 * a DAT access token obtained from TokenStoreManager. Wraps the request in a
 * react-query query keyed by the user's PPO number, so results are cached per
 * user and automatically re-fetched when the PPO number changes.
 *
 * @returns A react-query UseQueryResult whose `data` is a
 *   PensionStatementResponseI (the list of statements plus the statement PDF
 *   URI), along with the standard loading, error, and refetch state.
 *
 * @example
 * const { data, isLoading, refetch } = usePensionerStatement();
 */
export function usePensionerStatement() {
  const { user } = useAuthStore();
  const ppoNo = user?.ppo_no;
  const encData = encryptText(JSON.stringify({ ppo_no: ppoNo }));
  return useQuery({
    queryKey: ['pensioner', 'statement', ppoNo],
    queryFn: async () => {
      const token = await TokenStoreManager.getDatAccessToken();
      return http.post<PensionStatementResponseI>(
        ENDPOINTS.PENSIONER_STATEMENTS.SIX_MONTH_STATEMENTS,
        { payload: encData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    select: (data) => data.data,
  });
}
