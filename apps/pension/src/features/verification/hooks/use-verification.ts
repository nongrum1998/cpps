import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import type { VerificationResponseT } from '../types';
import { useAuthStore } from '@stores/auth.store';

interface VerificationPayload {
  image_1: string;
  image_2?: string;
}

/**
 * Submits face verification photos to `POST /api/verification/`.
 *
 * Sends base64-encoded face images as a plain object (auto-encrypted by
 * the request interceptor). On success with `self_ver_code !== '03'` and
 * stored `approval !== '00'`, updates `approval` to `'01'` in the auth
 * store to mark the photo as submitted.
 *
 * @returns TanStack Query mutation with `VerificationResponseT` result.
 */

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
const mockImage = process.env.EXPO_PUBLIC_TEST_IMAGE as string;

export function useSubmitVerification() {
  // TODO: change and saperate this
  const { setUser, user } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: VerificationPayload) => {
      const data = new URLSearchParams({
        image_1: __DEV__ ? mockImage : payload.image_1,
        ...(payload.image_2 ? { image_2: __DEV__ ? mockImage : payload.image_2 } : {}),
      });

      return http.post<VerificationResponseT>(ENDPOINTS.VERIFICATION.VERIFICATION, data, {
        headers,
        timeout: 30_000, //
      });
    },

    onSuccess: async (res) => {
      const data = res.data;
      if (res.success) {
        const regStatus = user?.approval;
        if (data?.self_ver_code !== '03' && regStatus !== '00') {
          setUser({
            approval: '01',
            username: user?.username || '',
            uid: user?.uid || '',
            name: user?.name || '',
            has_dlc: user?.has_dlc || '',
            ppo_no: user?.username || '',
          });
        }
      }
      return data;
    },
  });
}
