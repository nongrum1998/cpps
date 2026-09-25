import { useMutation } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type { ApiResponse } from '@sharedTypes/api';
import { useAuthStore } from '@stores/auth.store';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import type { DlcDeclarationDetails, DlcResponseEnvelope, DlcSubmitPayload } from '../types';

/** Values supplied by the face-verification screen for one DLC submission. */
type DlcSubmitInput = DlcDeclarationDetails & {
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
 * Validates the decrypted application envelope returned by the DLC endpoint.
 *
 * The shared HTTP wrapper reports whether the HTTP exchange succeeded, while
 * the DLC backend separately reports whether the declaration was accepted.
 * Requiring both fields here prevents an HTTP 200 response with a false or
 * malformed application status from being rendered as an approval.
 *
 * @param value - The runtime value exposed as `ApiResponse.data`.
 * @returns `true` when the value has the required `/dlc` response shape.
 */
function isDlcResponseEnvelope(value: unknown): value is DlcResponseEnvelope {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const envelope = value as Record<string, unknown>;
  return typeof envelope.status === 'boolean' && typeof envelope.message === 'string';
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
      : Application.getAndroidId() ?? 'unknown';

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
 * {@link ApiResponse} envelope with the backend application status normalized
 * into `success`. The mutation rejects when the HTTP exchange fails,
 * authenticated PPO details or device metadata cannot be resolved, or the
 * decrypted response envelope is malformed.
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

      const response = await http.post<DlcResponseEnvelope>(ENDPOINTS.DLC.CREATE, requestBody);

      if (!response.success) {
        throw new Error('DLC submission request failed');
      }

      if (!isDlcResponseEnvelope(response.data)) {
        throw new Error('Invalid DLC response envelope');
      }

      return {
        ...response,
        success: response.data.status,
        message: response.data.message,
      };
    },
  });
}
