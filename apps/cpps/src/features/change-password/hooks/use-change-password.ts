import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import { ChangePasswordInput } from '../validators';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: Omit<ChangePasswordInput, 'confirmPassword'>) =>
      http.post(ENDPOINTS.USER.CHANGE_PASSWORD, data),
  });
}
