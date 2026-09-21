import { FaceVerificationScreen } from '@features/verification/screens';

/**
 * Expo-router page for the face verification camera flow.
 *
 * Receives `registrationStatus` as a search param:
 * - `1` = registration/re-registration mode (two photos)
 * - `0` = normal verification (single photo)
 */
export default function FaceRecognitionPage() {
  return <FaceVerificationScreen />;
}
