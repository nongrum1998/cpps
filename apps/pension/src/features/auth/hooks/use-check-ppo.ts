import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http';
import { RegistrationStatusInput } from '../validators';
import { useRegistrationStore } from '../store/registration';

type PPOStatus = {
  bank_account_no: string;
  dob: string;
  status: string;
};

export function useCheckPPO() {
  const { nextStep, saveData, setValidationData } = useRegistrationStore();
  return useMutation({
    mutationFn: (data: RegistrationStatusInput) =>
      http.post<PPOStatus>(ENDPOINTS.USER.REGISTRATION_STATUS, data),
    onSuccess: (data, variables) => {
      if (!data.success) return;
      if (!data.data) return;

      const dob = data.data?.dob;
      const bank_account_no = data.data?.bank_account_no;

      if (!dob || !bank_account_no) return;
      saveData({ ppo_no: variables.ppo_no });
      setValidationData({
        bank_account_number: bank_account_no,
        dob,
      });
      nextStep();
    },
  });
}
