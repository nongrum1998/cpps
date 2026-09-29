import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { LeaveReason } from '../types';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { transformData } from '@utils/helpers/transform-data';

export function useLeaveReason() {
  const { emp_cd, isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE.REASON(emp_cd),
    queryFn: () => rpc<LeaveReason[]>(METHODS.GET_LEAVE_REASON),
    select: (data) => transformData<LeaveReason>(data.data),
    enabled: !!emp_cd && isSignedIn,
  });
}
