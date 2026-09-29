import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { GPFStatement } from '../types';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { rpc } from '@utils/api';

type Props = {
  financialYear: string;
};

export function useGpfStatements({ financialYear }: Props) {
  const { isSignedIn, user } = useAuthStore();

  const isDataPresent: boolean = !!user?.pf_no && !!user?.pf_series && !!user?.pf_type;

  const isEnabled = !!financialYear && isSignedIn && user?.emp_type === 'DB' && isDataPresent;

  const queryKey = QUERY_KEYS.GPF.STATEMENTS(financialYear, 'S', user?.pf_series, user?.pf_no);

  return useQuery({
    enabled: isEnabled,
    queryKey: queryKey,
    queryFn: () =>
      rpc<GPFStatement>(METHODS.GET_GPF_STATEMENT, {
        financial_year: financialYear,
        gpf_series: user?.pf_series,
        gpf_acc_no: user?.pf_no,
      }),
    select: (data) => data.data,
    staleTime: STALE_TIMES.GPF,
  });
}
