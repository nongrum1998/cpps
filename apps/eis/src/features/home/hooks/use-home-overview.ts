import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { HomeOverviewT } from '../types/home';

export function useHomeOverview() {
  const { emp_cd, isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.HOME.OVERVIEW(emp_cd),
    queryFn: () => rpc<HomeOverviewT>(METHODS.GET_EMP_OVERVIEW, { emp_cd }),
    select: (data) => data.data,
    enabled: isSignedIn,
  });
}
