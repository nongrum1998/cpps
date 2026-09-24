import { SafeAreaView } from 'react-native-safe-area-context';
import { FooterImg } from '@components/common';
import { DLCHeader, DLCInstructions } from '../components';
import { Container } from '@components/layout';
import { SubmitDLCCard } from '@components/common/submit-dlc-card';

/**
 * Renders the "Digital Life Certificate" (DLC) self-verification screen.
 *
 * The screen is the orchestrator for the DLC flow: it owns all hooks and
 * derived state — the front-camera device, camera permission, network status,
 * and the backend initialization/registration status — and delegates the
 * presentational markup to feature components:
 *
 * - {@link DLCHeader} for the screen introduction.
 * - {@link DLCInstructions} for the numbered steps and any status warning.
 * - {@link DLCAlerts} for camera-permission / camera-availability / offline
 *   diagnostics.
 * - {@link DLCActions} for the "Capture Photo" / "Allow Camera Access" /
 *   "Open App Settings" primary action area.
 *
 * The capture button is disabled until the front camera is available and
 * camera permission is granted and the device is online. When the button is
 * activated it routes to the face-recognition flow, passing a registration
 * status param derived from the backend `regStatus` ("02" or "03" require
 * registration). If a non-empty status `msg` is returned by initialization, it
 * is surfaced as a warning banner.
 *
 * @returns The DLC screen wrapped in a safe area and scroll view.
 */
export function DLCScreen() {
  // TODO: proper configure this
  const msg = '';
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      {/* Main Content Area */}

      <Container className="gap-4">
        {/* Instructions Card */}

        <DLCHeader />

        <DLCInstructions msg={msg} />

        {/* Primary Action Button | Check if camera Permission is granted */}
        <SubmitDLCCard />
        {/* Partner Logos */}
        <FooterImg />
      </Container>
    </SafeAreaView>
  );
}
