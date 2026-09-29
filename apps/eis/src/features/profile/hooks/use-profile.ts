import { UserT } from '@sharedTypes/auth';
import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';

export function useProfile() {
  const { emp_cd, isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME(emp_cd),
    queryFn: () => rpc<UserT>(METHODS.GET_EMP_DETAILS, { emp_cd }),
    select: (data) => data.data,
    enabled: isSignedIn,
  });
}
