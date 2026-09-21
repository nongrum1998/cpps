import { LoginT } from '@sharedTypes/auth';
import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http';
import { LoginInput } from '../validators';
import { useAuthStore } from '@stores/auth.store';

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

export function useLogin() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (data: LoginInput) =>
      http.post<LoginT>(ENDPOINTS.AUTH.LOGIN, data, { headers }),
    onSuccess: ({ success, data }, { username }) => {
      if (!success) return;
      if (!data) return;
      setUser({
        approval: data.approval,
        username: data.username,
        uid: data.uid,
        name: data.name,
        has_dlc: data.has_dlc,
        ppo_no: username,
      });
    },
  });
}
