import { Text, Image, View } from 'react-native';
import { Button } from '@components/ui';
import type { VerificationResponseT } from '../types';
import { Container } from '@components/layout';
import { PAGE_ROUTES } from '@utils/constants';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Ternary } from '@components/common';

/** Props for {@link FaceVerificationResultView}. */
export interface FaceVerificationResultViewProps {
  /** Server response driving the branch: '00' success, '22' rejected. */
  verResponse: VerificationResponseT;
  /** Data URI of the latest photo; shown only on the rejection branch. */
  previewUri: string;
  /** True when a second photo was submitted (enables declaration CTA). */
  hasSecondImage: boolean;
  /** Invoked by the "Submit Self Declaration" button. */
  onProceedToDeclaration: () => void;
}

/**
 * Enhanced verification result screen with structured status cards instead of simple alert boxes.
 */
export const SuccessStatusCard = ({ message }: { message: string }) => {
  const { navigate } = useSafeNavigation();
  return (
    <View className="gap-y-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
          <Text className="text-base font-black text-white">✓</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-emerald-900">Verification Successful</Text>
          <Text className="text-sm font-semibold text-emerald-700">Identity confirmed</Text>
        </View>
      </View>

      <View className="gap-y-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <Text className="text-sm font-bold uppercase tracking-wider text-emerald-900">
            Official Approval
          </Text>
        </View>
        <Text className="text-sm font-medium leading-relaxed text-emerald-950/80">
          Your photo has been successfully submitted and is approved by the Treasury Officer at your
          registered Treasury Office for pension disbursement.
        </Text>
      </View>

      <View className="h-[1px] w-full bg-emerald-500/20" />

      <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
        {message || 'Your face verification was processed and matched successfully.'}
      </Text>
      <Button size="lg" variant="primary" onPress={() => navigate(PAGE_ROUTES.HOME)}>
        Go Back
      </Button>
    </View>
  );
};

export interface RejectStatusCardProps {
  message: string;
  previewUri: string;
  onRetakePhoto?: () => void;
}

export const RejectStatusCard = ({ message, previewUri, onRetakePhoto }: RejectStatusCardProps) => {
  return (
    <View className="items-center gap-y-4 rounded-md border border-red-500/20 bg-red-500/20 p-5">
      {previewUri ? (
        <View className="relative">
          <Image
            source={{ uri: previewUri }}
            className="h-52 w-44 rounded-md border-2 border-destructive"
          />
          <View className="absolute -bottom-3 self-center rounded-full bg-destructive px-3 py-1 shadow-sm">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
              Rejected Photo
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-2 w-full items-center">
        <Text className="mb-1 text-center text-lg font-bold text-destructive">
          Photo Verification Failed
        </Text>
        <Text className="text-destructive/90 text-center text-sm font-medium leading-relaxed">
          {message ||
            'The uploaded photo could not be verified. Please ensure proper lighting and a clear view.'}
        </Text>
      </View>

      {onRetakePhoto && (
        <Button size={'lg'} variant="destructive" onPress={onRetakePhoto} className="w-full">
          Retake Photo
        </Button>
      )}
    </View>
  );
};

export interface DeclarationStatusCardProps {
  proceedDeclaration: () => void;
}

export const DeclarationStatusCard = ({
  proceedDeclaration: onProceedToDeclaration,
}: DeclarationStatusCardProps) => {
  return (
    <View className="gap-y-4">
      {/* Pending Approval Badge & Notice */}
      <View className="gap-y-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <Text className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Pending Official Approval
          </Text>
        </View>
        <Text className="text-sm font-medium leading-relaxed text-amber-950/80">
          Your photo has been successfully submitted and is subject to approval by the Treasury
          Officer at your registered Treasury Office for pension disbursement.
        </Text>
      </View>

      {/* Next Action Card */}
      <View className="shadow-xs gap-y-4 rounded-md border border-border bg-card p-5">
        <View>
          <Text className="text-base font-bold text-foreground">Action Required</Text>
          <Text className="mt-1 text-sm leading-relaxed text-muted-foreground">
            You can now proceed with your self-declaration for Non-Employment or Non-Marriage
            status.
          </Text>
        </View>

        <Button size="lg" className="w-full" onPress={onProceedToDeclaration}>
          Submit Self Declaration
        </Button>
      </View>
    </View>
  );
};

export function FaceVerificationResultView({
  verResponse,
  previewUri,
  hasSecondImage,
  onProceedToDeclaration,
}: FaceVerificationResultViewProps) {
  const { navigate } = useSafeNavigation();
  const code = verResponse.self_ver_code;
  return (
    <Container className="gap-y-5">
      {/* Header Section */}
      <View className="gap-2">
        <View className="bg-primary/10 self-start rounded-full py-1">
          <Text className="text-sm font-bold uppercase tracking-wider text-primary">
            Verification
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Identity Verification
        </Text>

        <Text className="text-sm font-medium text-muted-foreground">
          Review your status details below to proceed.
        </Text>
      </View>

      <Ternary
        condition={code === '00'}
        ifTrue={<SuccessStatusCard message={verResponse.msg} />}
        ifFalse={
          <Ternary
            condition={code === '22' && !hasSecondImage}
            ifTrue={
              <RejectStatusCard
                message={verResponse.msg}
                previewUri={previewUri}
                onRetakePhoto={() => navigate(PAGE_ROUTES.FACE_RECOGNITION)}
              />
            }
            ifFalse={<DeclarationStatusCard proceedDeclaration={onProceedToDeclaration} />}
          />
        }
      />
    </Container>
  );
}
