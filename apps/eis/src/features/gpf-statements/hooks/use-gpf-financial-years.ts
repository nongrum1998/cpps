import { useQuery } from '@tanstack/react-query';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { GpfFinancialYear } from '../types';
import { useAuthStore } from '@stores/auth.store';
import { rpc } from '@utils/api';

export function useGPFFinancialYear() {
  const { isSignedIn, user } = useAuthStore();

  const empType = user?.emp_type;

  const isEnabled = !!isSignedIn && empType === 'DB';

  const payload = {
    gpf_series: user?.pf_series,
    gpf_acc_no: user?.pf_no,
  };

  return useQuery({
    queryKey: QUERY_KEYS.GPF.FINANCIAL_YEARS(payload),
    enabled: isEnabled,
    queryFn: () => rpc<GpfFinancialYear[]>(METHODS.GET_GPF_FINANCIAL_YEAR, payload),
    select: (data) => data.data,
    staleTime: STALE_TIMES.GPF,
  });
}
