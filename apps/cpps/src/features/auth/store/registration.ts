import { create } from 'zustand';
import { RegisterPensionerInput } from '../validators';

const defaultValue: RegisterPensionerInput = {
  ppo_no: '',
  dob: '',
  password: '',
  bank_account_number: '',
};

interface RegistrationStore {
  step: number;
  formData: RegisterPensionerInput;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveData: (data: Partial<RegisterPensionerInput>) => void;
  reset: () => void;

  validation: Omit<RegisterPensionerInput, 'ppo_no' | 'password'> | null;
  setValidationData: (data: Omit<RegisterPensionerInput, 'ppo_no' | 'password'>) => void;

  isSuccess: boolean;
  setSuccess: () => void;
}

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  step: 1,
  formData: defaultValue,
  validation: null,
  isSuccess: false,
  setValidationData: (data) => set({ validation: data }),

  setStep: (step) => set({ step }),
  nextStep: () => {
    if (get().step < 4) {
      set((state) => ({ step: state.step + 1 }));
    }
  },
  prevStep: () => {
    if (get().step > 1) {
      set((state) => ({ step: state.step - 1 }));
    }
  },

  saveData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setSuccess: () => set({ isSuccess: true }),

  reset: () => set({ step: 1, formData: defaultValue, isSuccess: false }),
}));
