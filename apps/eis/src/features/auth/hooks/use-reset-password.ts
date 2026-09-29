import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { toast } from '@components/ui';
import { PAGE_ROUTES } from '@utils/constants/routes';
import {
  ResetPasswordSchema,
  ResetPasswordOtpSchema,
  ResetPasswordInputs,
  ResetPasswordOtpInputs,
} from '../validators/reset-password.schema';
import { http } from '@utils/api';

export const useResetPassword = () => {
  const router = useRouter();
  const search = useSearchParams();
  const phone_no = search.get('phone') || '';

  const [status, setStatus] = useState<'INPUT_PASSWORD' | 'INPUT_OTP'>('INPUT_PASSWORD');
  const [passwordData, setPasswordData] = useState<ResetPasswordInputs | null>(null);

  const passwordMethods = useForm<ResetPasswordInputs>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  });

  const otpMethods = useForm<ResetPasswordOtpInputs>({
    resolver: zodResolver(ResetPasswordOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { phone_no: string }) => http.post('', data),
    onSuccess: (data: any) => {
      if (data.success) {
        setStatus('INPUT_OTP');
        toast.success('Secure Code Sent', {
          description: data.message || 'Verification code sent to your phone',
        });
      } else {
        toast.error('OTP Error', {
          description: data.message || 'Failed to send verification code',
        });
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: {
      phone_no: string;
      otp: string;
      password: string;
      confirm_password: string;
    }) => {
      return http.post('', data);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        router.replace(PAGE_ROUTES.AUTH.LOGIN);
        toast.success('Security Update', {
          description: data.message || 'Password reset successful',
        });
      } else {
        toast.error('Update Failed', {
          description: data.message || 'Unable to reset password',
        });
      }
    },
  });

  const onPasswordSubmit = (data: ResetPasswordInputs) => {
    if (!phone_no) {
      toast.error('Update Failed', {
        description: 'Phone number missing!',
      });
      return;
    }
    setPasswordData(data);
    sendOtpMutation.mutate({ phone_no });
  };

  const onOtpSubmit = (data: ResetPasswordOtpInputs) => {
    if (!passwordData || !phone_no) {
      toast.error('Update Failed', {
        description: 'Missing data for reset.',
      });
      return;
    }
    resetPasswordMutation.mutate({
      phone_no,
      otp: data.otp,
      password: passwordData.password,
      confirm_password: passwordData.confirm_password,
    });
  };

  return {
    status,
    phone_no,
    passwordMethods,
    otpMethods,
    sendOtpMutation,
    resetPasswordMutation,
    onPasswordSubmit,
    onOtpSubmit,
  };
};
