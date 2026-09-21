import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import type { VerificationResponseT } from '../types';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

interface DLCPayload {
  selfVerNec: 'Yes' | 'No';
  selfVerNmc: 'Yes' | 'No' | '';
  self_ver_code: string;
}

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
 * Submits the Digital Life Certificate (DLC) self-declaration to `POST /api/lc/`.
 *
 * Device metadata (device name, device ID) is sent as plain strings;
 * the request interceptor auto-encrypts all plain-object fields via Fernet.
 * `ver_mode_code` is fixed at `'01'`; `place` is always empty string.
 *
 * @returns TanStack Query mutation with `VerificationResponseT` result.
 */
export function useSubmitDLC() {
  return useMutation({
    mutationFn: async (payload: DLCPayload) => {
      const { deviceName, deviceId } = await resolveDeviceMetadata();

      return http.post<VerificationResponseT>(ENDPOINTS.DLC.CREATE, {
        selfVerNec: payload.selfVerNec,
        selfVerNmc: payload.selfVerNmc,
        device: deviceName,
        device_id: deviceId,
        ver_mode_code: '01',
        self_ver_code: payload.self_ver_code,
        place: '',
      });
    },
  });
}
