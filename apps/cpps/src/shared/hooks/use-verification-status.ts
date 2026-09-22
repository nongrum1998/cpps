import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';
import { VerificationStatusT } from '@features/verification';

export function useVerificationStatus() {
  const { user, isSignedIn } = useAuthStore();

  const ppo_no = user?.ppo_no;

  const isEnabled = isSignedIn && !!ppo_no;

  return useQuery({
    queryKey: ['verificationStatus', ppo_no],
    queryFn: () => http.post<VerificationStatusT>(ENDPOINTS.VERIFICATION.STATUS, { ppo_no }),
    select: (d) => d.data,
    enabled: isEnabled,
  });
}
