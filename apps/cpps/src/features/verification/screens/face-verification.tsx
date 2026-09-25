import { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FaceCaptureCamera } from '@components/common/face-capture-camera';
import { useFaceCapture } from '@hooks/use-face-capture';
import {
  FaceVerificationPhotoPreviewStep,
  FaceVerificationResultView,
  FaceVerificationDeclarationForm,
  FaceVerificationConfirmDialog,
  FaceVerificationLoadingView,
  FaceVerificationErrorView,
} from '../components';
import { useSubmitDLC } from '../hooks';
import type {
  FaceVerificationPhase,
  FaceVerificationRouteParams,
  VerificationResponseT,
} from '../types';
import { FooterImg } from '@components/common';
import { Container } from '@components/layout';
import { useDlcStatus } from '@hooks/use-dlc-status';

type FaceVerificationScreenProps = FaceVerificationRouteParams;

export function FaceVerificationScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { data: dlcStatus } = useDlcStatus();

  // State machine
  const [phase, setPhase] = useState<FaceVerificationPhase>('declaration');
  const [previewUri, setPreviewUri] = useState('');
  const [image1, setImage1] = useState('');
  const [verResponse, setVerResponse] = useState<VerificationResponseT | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Declaration form
  const [selfVerNec, setSelfVerNec] = useState<'1' | '2' | '0'>('0');
  const [selfVerNmc, setSelfVerNmc] = useState<'1' | '2' | '0'>('0');

  // Dialogs
  const [dlcDialogOpen, setDlcDialogOpen] = useState(false);

  // API hooks
  const dlcMutation = useSubmitDLC();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // Shared blink-liveness capture pipeline: detection, capture, and
  // compression now live in `useFaceCapture`. The screen keeps the
  // post-capture business rules (registration preview vs. direct submit).
  const capture = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: async (cleanBase64) => {
      const uri = `data:image/jpeg;base64,${cleanBase64}`;
      setPreviewUri(uri);
      setPhase('preview');
    },
    onError: (message) => {
      setErrorMsg(message);
      setPhase('error');
    },
  });

  const handleSubmitDLC = () => setDlcDialogOpen(true);

  const confirmDLCSubmission = useCallback(() => {
    setDlcDialogOpen(false);
    setPhase('submitting');

    dlcMutation.mutate(
      {
        selfVerNec: selfVerNec,
        selfVerNmc: selfVerNmc,
        self_ver_code: verResponse?.self_ver_code ?? '',
        image: '',
      },
      {
        onSuccess: ({ data, ...restData }) => {
          if (restData.success) {
            if (data) {
              setVerResponse(data);
              setPhase('result');
            }
          } else {
            setErrorMsg(restData.message || 'DLC submission failed');
            setPhase('error');
          }
        },
      }
    );
  }, [dlcMutation, selfVerNec, selfVerNmc, verResponse]);

  const resetForSecondCapture = useCallback(() => {
    setPhase('declaration');
  }, []);

  if (!hasPermission || !device) {
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
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <View
        className="flex-1"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          capture.onLayout({ width, height });
        }}>
        {/* PHASE: camera — live feed with blink detection */}
        {phase === 'camera' && (
          <FaceCaptureCamera
            device={device}
            outputs={capture.outputs}
            faces={capture.faces}
            frameWidth={capture.frameSize.width}
            frameHeight={capture.frameSize.height}
            viewWidth={capture.layoutSize.width}
            viewHeight={capture.layoutSize.height}
            message={capture.message}
          />
        )}

        {/* PHASE: capturing / submitting — loading spinner */}
        {(phase === 'capturing' || phase === 'submitting') && <FaceVerificationLoadingView />}

        {/* PHASE: preview — first/second photo confirmation (registration mode only) */}
        {phase === 'preview' && (
          <FaceVerificationPhotoPreviewStep
            previewUri={previewUri}
            actionLabel={'Submit Photo'}
            onSubmitPress={handleSubmitDLC}
          />
        )}

        {/* PHASE: result — server response display */}
        {phase === 'result' && (
          <FaceVerificationResultView
            isSuccess={dlcMutation.data?.success || false}
            msg={dlcMutation.data?.message || ''}
          />
        )}

        {/* PHASE: declaration — self-declaration form */}
        {phase === 'declaration' && (
          <FaceVerificationDeclarationForm
            nec={dlcStatus?.nec || ('0' as any)}
            nmc={dlcStatus?.nmc || ('0' as any)}
            onChangeNec={setSelfVerNec}
            onChangeNmc={setSelfVerNmc}
            onSubmit={() => setPhase('camera')}
          />
        )}

        {/* PHASE: error */}
        {phase === 'error' && (
          <FaceVerificationErrorView
            errorMsg={errorMsg}
            onTryAgainPress={() => setPhase('camera')}
          />
        )}
      </View>

      {/* DLC TERMS DIALOG */}
      <FaceVerificationConfirmDialog
        open={dlcDialogOpen}
        onOpenChange={setDlcDialogOpen}
        title="Terms and Conditions."
        description={
          'By submitting this Declaration, you have agreed that the ' +
          'information furnished by you is true.\n\nAre you sure you want to submit?'
        }
        destructive
        onConfirm={confirmDLCSubmission}
      />
    </SafeAreaView>
  );
}

export type { FaceVerificationScreenProps };
