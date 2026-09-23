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
import { useSubmitVerification, useSubmitDLC } from '../hooks';
import type {
  FaceVerificationPhase,
  FaceVerificationRouteParams,
  VerificationResponseT,
} from '../types';
import { FooterImg } from '@components/common';
import { Container } from '@components/layout';
import { useSnackbar } from '@hooks/use-snackbar';
import { useInitializeVerification } from '@hooks/use-init-verification';

type FaceVerificationScreenProps = FaceVerificationRouteParams;

export function FaceVerificationScreen() {
  const { regStatus } = useInitializeVerification();

  const isRegistrationRequired = regStatus === '03' || regStatus === '02';
  const registrationStatus: number = isRegistrationRequired ? 1 : 0;
  const { hasPermission, requestPermission } = useCameraPermission();
  const { showSnackbar } = useSnackbar();
  const device = useCameraDevice('front');

  // State machine
  const [phase, setPhase] = useState<FaceVerificationPhase>('camera');
  const [previewUri, setPreviewUri] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [verResponse, setVerResponse] = useState<VerificationResponseT | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Declaration form
  const [selfVerNec, setSelfVerNec] = useState<'Yes' | 'No' | ''>('No');
  const [selfVerNmc, setSelfVerNmc] = useState<'Yes' | 'No' | ''>('No');

  // Dialogs
  const [dlcDialogOpen, setDlcDialogOpen] = useState(false);

  // API hooks
  const verificationMutation = useSubmitVerification();
  const dlcMutation = useSubmitDLC();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const submitVerification = useCallback(
    async (img1: string, img2?: string) => {
      setPhase('submitting');

      verificationMutation.mutate(
        { image_1: img1, image_2: img2 },
        {
          onSuccess: (data) => {
            if (data.success) {
              if (data.data) {
                setVerResponse(data.data);
                const selfVerCode: string = data.data.self_ver_code;
                if (selfVerCode === '00' || selfVerCode === '22') {
                  setPhase('result');
                } else if (selfVerCode === '4' || selfVerCode === '04') {
                  setPhase('declaration');
                } else if (img2 !== '') {
                  setPhase('result');
                } else {
                  setPhase('result');
                  setErrorMsg(data.message || 'Verification failed');
                }
              }
            } else {
              setErrorMsg(data.message || 'Verification failed');
              setPhase('error');
            }
          },
        }
      );
    },
    [verificationMutation]
  );

  // Shared blink-liveness capture pipeline: detection, capture, and
  // compression now live in `useFaceCapture`. The screen keeps the
  // post-capture business rules (registration preview vs. direct submit).
  const capture = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: async (cleanBase64) => {
      const uri = `data:image/jpeg;base64,${cleanBase64}`;
      setPreviewUri(uri);

      // Registration mode: first photo → preview confirmation screen.
      if (registrationStatus === 1 && !image1) {
        setImage1(cleanBase64);
        setPhase('preview');
        return;
      }

      // Registration mode: second photo → preview confirmation (submitted
      // after approval).
      if (registrationStatus === 1 && image1 && !image2) {
        setImage2(cleanBase64);
        setPhase('preview');
        return;
      }

      // Normal mode: single photo → submit.
      if (registrationStatus === 0) {
        setImage1(cleanBase64);
        await submitVerification(cleanBase64, '');
        return;
      }
    },
    onError: (message) => {
      setErrorMsg(message);
      setPhase('error');
    },
  });

  const handleSubmitDLC = useCallback(() => {
    const selfVerCode = verResponse?.self_ver_code ?? '';

    if (selfVerNec === '') {
      showSnackbar('Please select Yes or No', 'alert-triangle');
      return;
    }
    if (selfVerCode === '4' && selfVerNmc === '') {
      showSnackbar('Please select Yes or No', 'alert-triangle');
      return;
    }

    setDlcDialogOpen(true);
  }, [selfVerNec, selfVerNmc, verResponse, showSnackbar]);

  const confirmDLCSubmission = useCallback(() => {
    setDlcDialogOpen(false);
    setPhase('submitting');

    dlcMutation.mutate(
      {
        selfVerNec: selfVerNec as 'Yes' | 'No',
        selfVerNmc: selfVerNmc as 'Yes' | 'No' | '',
        self_ver_code: verResponse?.self_ver_code ?? '',
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
            actionLabel={
              registrationStatus === 1 && image1 && !image2 ? 'Take Second Photo' : 'Submit Photo'
            }
            onSubmitPress={() => {
              if (registrationStatus === 1 && image1 && !image2) {
                // Approved the first photo; return to camera to capture the second.
                capture.resetBlinkState();
                setPreviewUri('');
                setPhase('camera');
              } else if (registrationStatus === 1 && image1 && image2) {
                // Approved the second photo; submit both images.
                void submitVerification(image1, image2);
              }
            }}
          />
        )}

        {/* PHASE: result — server response display */}
        {phase === 'result' && verResponse && (
          <FaceVerificationResultView
            verResponse={verResponse}
            previewUri={previewUri}
            hasSecondImage={image2 !== ''}
            onProceedToDeclaration={resetForSecondCapture}
          />
        )}

        {/* PHASE: declaration — self-declaration form */}
        {phase === 'declaration' && verResponse && (
          <FaceVerificationDeclarationForm
            selfVerCode={verResponse.self_ver_code}
            selfVerNec={selfVerNec}
            selfVerNmc={selfVerNmc}
            onChangeNec={setSelfVerNec}
            onChangeNmc={setSelfVerNmc}
            onSubmit={handleSubmitDLC}
            previewUri={previewUri}
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
