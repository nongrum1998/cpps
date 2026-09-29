import { useQuery } from '@tanstack/react-query';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { rpc } from '@utils/api';
import { useAuthStore } from '@stores/auth.store';

export function useNpsFinYear() {
  const { isSignedIn, user } = useAuthStore();

  const isEnabled = !!isSignedIn;

  const body = {
    pran: user?.pf_pran_no,
  };

  return useQuery({
    queryKey: QUERY_KEYS.GPF.FINANCIAL_YEARS(body),
    enabled: isEnabled,
    queryFn: () => rpc<{ fin_year: string; id: string }[]>(METHODS.GET_NPS_FINANCIAL_YEAR, body),
    select: (data) => data.data,
    staleTime: STALE_TIMES.GPF,
  });
}
