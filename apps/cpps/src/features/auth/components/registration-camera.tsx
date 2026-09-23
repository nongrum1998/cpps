import { FooterImg } from '@components/common';
import { CameraPainter } from '@components/common/camera-painter';
import { Container } from '@components/layout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraOutput, useCameraDevice, usePhotoOutput } from 'react-native-vision-camera';
import { createFaceDetectorOutput, Face } from 'react-native-vision-camera-face-detector';

/**
 * Renders the active front camera full-screen, overlays detected-face
 * boxes scaled from detector space to view space via
 * {@link FaceVerificationPainter}, and shows the current liveness
 * instruction in a translucent banner. The banner text is subscribed
 * from {@link useFaceVerificationStore}; detection logic stays in the
 * parent FaceVerificationScreen.
 */
export function RegistrationCamera() {
  const device = useCameraDevice('front');
  const message = 'Blinked your eyes';

  const photoOutput = usePhotoOutput({
    qualityPrioritization: 'speed',
  });

  const [faces, setFaces] = useState<Face[]>([]);
  const [faceDetectorOutput, setFaceDetectorOutput] = useState<CameraOutput | null>(null);
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const outputs = useMemo(
    () => (faceDetectorOutput ? [faceDetectorOutput, photoOutput] : []),
    [faceDetectorOutput, photoOutput]
  );

  const detectedFacesHandlerRef = useRef<{ current?: (faces: Face[]) => void }>({});

  useEffect(() => {
    const output = createFaceDetectorOutput({
      performanceMode: 'accurate',
      runLandmarks: true,
      runClassifications: true,
      onFacesDetected: (detectedFaces) => {
        detectedFacesHandlerRef.current.current?.(detectedFaces);
      },
      onError: (error: unknown) => {
        if (__DEV__) {
          console.error('Face detection error:', error);
        }
      },
    });
    setFaceDetectorOutput(output);
    // Nitro hybrids are GC-managed; no eager dispose() needed on unmount.
  }, []);

  if (!device) {
    return (
      <Container>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base text-muted-foreground">Loading Camera...</Text>
          <FooterImg />
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
        <View
          className="flex-1"
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setLayoutSize({ width, height });
          }}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            outputs={outputs}
          />
          <CameraPainter
            faces={faces}
            frameWidth={frameSize.width}
            frameHeight={frameSize.height}
            viewWidth={layoutSize.width}
            viewHeight={layoutSize.height}
          />
          <View className="absolute bottom-5 left-5 right-5 rounded-xl bg-black/75 p-4">
            <Text className="text-center text-lg font-bold text-white">{message}</Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
