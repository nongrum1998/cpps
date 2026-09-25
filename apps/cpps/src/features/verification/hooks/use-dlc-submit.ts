import { useMutation } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type { ApiResponse } from '@sharedTypes/api';
import { useAuthStore } from '@stores/auth.store';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import type { DeclarationAnswer, DlcDeclarationDetails, DlcSubmitPayload } from '../types';

/** Values supplied by the face-verification screen for one DLC submission. */
type DlcSubmitInput = Omit<DlcDeclarationDetails, 'nec' | 'nmc'> & {
  nec: DeclarationAnswer | '2';
  nmc: DeclarationAnswer | '2';
  image: string;
};

/** Device metadata attached to every DLC submission. */
interface DeviceMetadata {
  /** Human-readable application name (fallback `'Unknown'`). */
  deviceName: string;
  /** OS-level device identifier (iOS `idForVendor` / Android ID, fallback `'unknown'`). */
  deviceId: string;
}

/**
 * Resolves device metadata for the DLC payload.
 *
 * Must be called from an async context: Hermes does not support top-level
 * `await`, and module-scope awaits crash the JS bundle at compile time
 * ("')' expected at end of parenthesized expression").
 *
 * @returns The application name and platform-specific device identifier.
 */
async function resolveDeviceMetadata(): Promise<DeviceMetadata> {
  const deviceName = Application.applicationName ?? 'Unknown';

  const deviceId =
    Platform.OS === 'ios'
      ? (await Application.getIosIdForVendorAsync()) ?? 'unknown'
      : (await Application.getAndroidId()) ?? 'unknown';

  return { deviceName, deviceId };
}

/**
 * Submits a DLC declaration and captured image to `POST /dlc`.
 *
 * The hook reads PPO identity from the authenticated user, resolves the
 * platform device metadata, and constructs one {@link DlcSubmitPayload}. The
 * plain object is passed to the existing HTTP client so its Fernet interceptor
 * encrypts the request. The captured image is forwarded unchanged and is not
 * logged or persisted by this hook.
 *
 * @returns A TanStack Query mutation that resolves to the shared
 * {@link ApiResponse} envelope. The mutation rejects when authenticated PPO
 * details or device metadata cannot be resolved.
 */
export function useSubmitDLC() {
  const { user } = useAuthStore();

  return useMutation<ApiResponse<unknown>, Error, DlcSubmitInput>({
    mutationFn: async ({ nec, nmc, image }) => {
      const ppoId = user?.ppo_id;
      const ppoNo = user?.ppo_no;

      if (!ppoId || !ppoNo) {
        throw new Error('Authenticated PPO details are required');
      }

      if (nec === '2' || nmc === '2') {
        throw new Error('DLC declaration answers must be 0 or 1');
      }

      const { deviceName, deviceId } = await resolveDeviceMetadata();
      const requestBody: DlcSubmitPayload = {
        deviceName,
        deviceId,
        ppo_id: ppoId,
        ppo_no: ppoNo,
        nec,
        nmc,
        place: '',
        image,
      };

      return http.post<unknown>(ENDPOINTS.DLC.CREATE, requestBody);
    },
  });
}
