import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { LeaveType } from '../types';
import { transformData } from '@utils/helpers/transform-data';

export function useLeaveType() {
  const { emp_cd, isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE.TYPE(emp_cd),
    queryFn: () => rpc<LeaveType[]>(METHODS.GET_LEAVE_TYPE),
    enabled: !!emp_cd && isSignedIn,
    select: (data) => transformData<LeaveType>(data.data),
  });
}
