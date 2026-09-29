import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { toast } from '@components/ui';
import { EmployeeTaxDetail } from '../types';

export function useEmployeeTax() {
  const { emp_cd, isSignedIn } = useAuthStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.TAX.DETAIL(emp_cd),
    queryFn: () => rpc<EmployeeTaxDetail>(METHODS.GET_EMP_TAX_DETAIL, { emp_cd }),
    staleTime: STALE_TIMES.TAX,
    select: (res) => res?.data,
    enabled: !!emp_cd && isSignedIn,
  });

  const { data, isFetching, isError, error, refetch, isLoading } = query;

  useEffect(() => {
    if (isError) {
      toast.error('Failed to Load Tax Data', {
        description: (error as any)?.message || 'Could not retrieve tax details',
      });
    }
  }, [isError, error]);

  return { data, isFetching, isError, error, refetch, isLoading };
}
