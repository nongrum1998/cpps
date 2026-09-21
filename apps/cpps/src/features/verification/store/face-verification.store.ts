import { create } from 'zustand';

interface FaceVerificationState {
  /** Liveness instruction displayed in the camera-phase banner
   *  (e.g. 'Please blink!!', 'Center your face'). */
  msg: string;

  /** Replaces the banner message. Writes the same string are ignored
   *  to avoid redundant notifications, preserving the previous
   *  functional-setState dedupe behavior. */
  setMsg: (msg: string) => void;
}

/**
 * Shared face-verification UI store.
 *
 * Holds the liveness instruction message produced by the blink-detection
 * logic in FaceVerificationScreen and consumed by FaceVerificationCamera's
 * bottom banner. Keeps the message reachable from any extracted component
 * without prop drilling. Transient UI only — nothing persisted.
 */
export const useFaceVerificationStore = create<FaceVerificationState>((set) => ({
  msg: 'Please blink!!',

  setMsg: (msg) =>
    set((state) => {
      if (state.msg === msg) return state;
      return { msg };
    }),
}));
