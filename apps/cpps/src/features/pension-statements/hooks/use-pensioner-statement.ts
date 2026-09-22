import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';
import { decryptText } from '@lib/encryption';
import { PensionStatementResponseI, PensionerStatement } from '../types';

export function usePensionerStatement() {
  const { user, isSignedIn } = useAuthStore();
  const ppoNo = user?.ppo_no;
  const isEnabled = !!ppoNo && isSignedIn;

  return useQuery({
    queryKey: ['pensioner', 'statement', ppoNo],
    queryFn: async () => {
      const response = await http.post<PensionStatementResponseI>(
        ENDPOINTS.PENSIONER_STATEMENTS.PAYMENT_SLIP,
        {
          ppo_no: ppoNo,
        }
      );
      return response.data;
    },
    enabled: isEnabled,
    select: (data) => {
      if (!data) return data;

      // Note: If your Axios response interceptor already decrypts the entire payload,
      // you can simply return `data` without any manual decryption here.

      let decryptedPension: PensionerStatement[] = [];
      let decryptedPdf: string = '';

      try {
        decryptedPension =
          typeof data.pension === 'string' ? JSON.parse(decryptText(data.pension)) : data.pension;
      } catch (e) {
        console.error('Failed to parse decrypted pension statement:', e);
      }

      try {
        decryptedPdf = typeof data.pdf === 'string' ? decryptText(data.pdf) : data.pdf;
      } catch (e) {
        console.error('Failed to decrypt PDF URI:', e);
      }

      return {
        ...data,
        pension: decryptedPension,
        pdf: decryptedPdf,
      };
    },
  });
}
