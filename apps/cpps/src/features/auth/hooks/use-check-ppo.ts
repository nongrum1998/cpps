import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http';
import { RegistrationStatusInput } from '../validators';
import { useRegistrationStore } from '../store/registration';
import { useAuthStore } from '@stores/auth.store';

type PPOStatus = {
  bank_accno: string;
  dob: string;
  pname: string;
  ppo_no: string;
};

export function useCheckPPO() {
  const { user } = useAuthStore();
  const { nextStep, setValidationData } = useRegistrationStore();
  return useMutation({
    mutationFn: (data: RegistrationStatusInput) =>
      http.post<PPOStatus>(ENDPOINTS.USER.REGISTRATION_STATUS, data),
    onSuccess: (data) => {
      if (!data.success) return;
      if (!data.data) return;

      const dob = data.data?.dob;
      const bank_account_no = data.data?.bank_accno;

      if (!dob || !bank_account_no) return;

      setValidationData({
        bank_accno: bank_account_no,
        ppo_no: user?.ppo_no,
        dob,
      });
      nextStep();
    },
  });
}
