import { type ComponentProps } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, type CameraDevice } from 'react-native-vision-camera';
import type { Face } from 'react-native-vision-camera-face-detector';
import { FaceVerificationPainter } from './face-verification-painter';
import { useFaceVerificationStore } from '../store/face-verification.store';

/** Outputs prop shape of the vision-camera `Camera` component. */
type CameraOutputs = ComponentProps<typeof Camera>['outputs'];

/** Props for {@link FaceVerificationCamera}. */
export interface FaceVerificationCameraProps {
  /** Front-facing camera device from `useCameraDevice('front')`. */
  device: CameraDevice;
  /** Memoized outputs array `[faceDetectorOutput, photoOutput]`. */
  outputs: CameraOutputs;
  /** Latest detected faces, painted by the overlay. */
  faces: Face[];
  /** Detector frame dimensions for coordinate scaling. */
  frameWidth: number;
  frameHeight: number;
  /** Screen-space dimensions of the wrapping `onLayout` view. */
  viewWidth: number;
  viewHeight: number;
}

/**
 * Renders the active front camera full-screen, overlays detected-face
 * boxes scaled from detector space to view space via
 * {@link FaceVerificationPainter}, and shows the current liveness
 * instruction in a translucent banner. The banner text is subscribed
 * from {@link useFaceVerificationStore}; detection logic stays in the
 * parent FaceVerificationScreen.
 */
export function FaceVerificationCamera({
  device,
  outputs,
  faces,
  frameWidth,
  frameHeight,
  viewWidth,
  viewHeight,
}: FaceVerificationCameraProps) {
  const message = useFaceVerificationStore((s) => s.msg);

  return (
    <>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} outputs={outputs} />
      <FaceVerificationPainter
        faces={faces}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        viewWidth={viewWidth}
        viewHeight={viewHeight}
        isFrontCamera={true}
      />
      {/* Bottom overlay message */}
      <View className="absolute bottom-5 left-5 right-5 rounded-xl bg-black/75 p-4">
        <Text className="text-center text-lg font-bold text-white">{message}</Text>
      </View>
    </>
  );
}
