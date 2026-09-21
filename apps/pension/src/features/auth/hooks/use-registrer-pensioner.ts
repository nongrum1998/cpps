import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http';
import { RegisterPensionerInput } from '../validators';

export function useRegisterPensioner() {
  return useMutation({
    mutationFn: (data: RegisterPensionerInput) => http.post(ENDPOINTS.USER.CREATE_PENSIONER, data),
  });
}
