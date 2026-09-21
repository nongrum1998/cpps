import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';
import { VerificationStatusT } from '@features/verification';

export function useVerificationStatus() {
  const { user, isSignedIn } = useAuthStore();

  // Fallback is DEV-ONLY; EXPO_PUBLIC_PPO_NO inlines into the bundle.
  const ppo_no = user?.ppo_no || process.env.EXPO_PUBLIC_PPO_NO;

  const isEnabled = isSignedIn && !!ppo_no;

  return useQuery({
    queryKey: ['verificationStatus', ppo_no],

    queryFn: () => http.post<VerificationStatusT>(ENDPOINTS.VERIFICATION.STATUS, { ppo_no }),

    select: (response) => {
      const data = response.data;
      if (!data) return;
      return {
        ...data,
        ver_status: data?.ver_status
          ?.replace(/\r?\n|\r/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      };
    },

    enabled: isEnabled,
  });
}
