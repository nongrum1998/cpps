import { Text, View } from 'react-native';
import { Button } from '@components/ui';
import { Container } from '@components/layout';
import { PAGE_ROUTES } from '@utils/constants';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Ternary } from '@components/common';

/** Props for {@link FaceVerificationResultView}. */
export interface FaceVerificationResultViewProps {
  /** Server response driving the branch: '00' success, '22' rejected. */
  isSuccess: boolean;
  /** Data URI of the latest photo; shown only on the rejection branch. */
  msg: string;
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
  onRetakePhoto?: () => void;
}

export const RejectStatusCard = ({ message, onRetakePhoto }: RejectStatusCardProps) => {
  return (
    <View className="items-center gap-y-4 rounded-md border border-red-500/20 bg-red-500/20 p-5">
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

export function FaceVerificationResultView({ isSuccess, msg }: FaceVerificationResultViewProps) {
  const { navigate } = useSafeNavigation();
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
        condition={isSuccess}
        ifTrue={<SuccessStatusCard message={msg} />}
        ifFalse={
          <RejectStatusCard
            message={msg}
            onRetakePhoto={() => navigate(PAGE_ROUTES.FACE_RECOGNITION)}
          />
        }
      />
    </Container>
  );
}
