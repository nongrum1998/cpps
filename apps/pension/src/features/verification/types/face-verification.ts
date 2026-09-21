/**
 * Phases of the face verification state machine.
 *
 * - `camera`    — live camera with blink-liveness detection (Phase 1)
 * - `capturing` — photo being taken and processed (Phase 2)
 * - `preview`   — first photo preview in registration mode
 * - `submitting`— API call in flight
 * - `result`    — server response displayed
 * - `declaration`— self-declaration form shown
 * - `error`     — unrecoverable error state
 */
export type FaceVerificationPhase =
  | 'camera'
  | 'capturing'
  | 'preview'
  | 'submitting'
  | 'result'
  | 'declaration'
  | 'error';

/**
 * Server response from `POST /api/verification/`.
 *
 * `msg` is the human-readable message displayed to the user.
 * `self_ver_code` drives result screen branching:
 * - `'00'` → accepted (green success box)
 * - `'22'` → rejected (photo + rejection reason)
 * - `'4'`  → show both non-employment AND re-marriage declarations
 * - other  → show non-employment declaration only
 */
export interface VerificationResponseT {
  msg: string;
  self_ver_code: '00' | '22' | '4' | '1' | string;
}

/**
 * Payload sent to `POST /api/lc/` for DLC (Digital Life Certificate) submission.
 */
export interface DLCSubmitPayload {
  selfVerNec: 'Yes' | 'No';
  selfVerNmc: 'Yes' | 'No' | '';
  self_ver_code: string;
  device: string;
  device_id: string;
  ver_mode_code: '01';
  place: '';
}

/**
 * Props passed to the FaceVerificationScreen from the route.
 */
export interface FaceVerificationRouteParams {
  registrationStatus: 0 | 1;
}
