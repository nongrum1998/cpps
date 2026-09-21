import { useMutation } from '@tanstack/react-query';
import { http } from '@utils/http';
import { LoginInput } from '../validators';
import { encryptText } from '@lib/encryption';
import { ENDPOINTS } from '@utils/constants';

export function useDatLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => {
      const ecryptedData = encryptText(JSON.stringify(data));
      return http.post<{ token: string }>(ENDPOINTS.AUTH.DAT_LOGIN, { payload: ecryptedData });
    },
  });
}
