import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@stores/auth.store';

const getRegStatusMessage = (currentReg: string | null | undefined): string => {
  if (currentReg === '02') {
    return 'Since the photo you submitted was rejected, the app will capture your photo twice.';
  } else if (currentReg === '03') {
    return "Since you haven't submitted your photo, the app will capture your photo twice.";
  }
  return '';
};

export function useInitializeVerification() {
  const { user, isSignedIn } = useAuthStore();
  const initData = {
    regStatus: user?.approval,
    dlc: user?.has_dlc,
  };

  const query = useQuery({
    queryKey: ['init', 'verification'],
    queryFn: () => initData,
    select: (data) => data,
    enabled: isSignedIn,
  });

  const regStatus = query.data?.regStatus;
  const dlcStatus = query.data?.dlc;

  return {
    regStatus,
    dlcStatus,
    msg: getRegStatusMessage(regStatus),
    ...query,
  };
}
