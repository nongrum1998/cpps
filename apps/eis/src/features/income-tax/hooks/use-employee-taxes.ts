import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { transformData } from '@utils/helpers/transform-data';
import { EmployeeTaxSummary } from '../types';

export function useEmployeeTaxes() {
  const { emp_cd, isSignedIn } = useAuthStore();

  const { data, isFetching, isError, error, refetch, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TAX.LIST(emp_cd),
    queryFn: () => rpc<EmployeeTaxSummary[]>(METHODS.GET_EMP_TAX_LIST, { emp_cd }),
    staleTime: STALE_TIMES.TAX,
    select: (res) => res?.data,
    enabled: !!emp_cd && isSignedIn,
  });

  const transformedData = transformData<EmployeeTaxSummary>(data);

  return { data: transformedData, isFetching, isError, error, refetch, isLoading };
}
