import { Text, Image, View } from 'react-native';
import { Button } from '@components/ui';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';

/** Props for {@link FaceVerificationPhotoPreviewStep}. */
export interface FaceVerificationPhotoPreviewStepProps {
  /** Data URI of the captured photo; empty string hides the image. */
  previewUri: string;
  /** Called by the action button; parent decides the next step. */
  onSubmitPress: () => void;
  /** Label for the action button; defaults to "Submit Photo". */
  actionLabel?: string;
}

/**
 * Registration-mode step confirming a captured photograph before
 * proceeding. Displays the photo, authenticity/privacy notice text, and
 * an action button whose label is configurable via {@link
 * FaceVerificationPhotoPreviewStepProps.actionLabel}. Purely presentational.
 */
export function FaceVerificationPhotoPreviewStep({
  previewUri,
  onSubmitPress,
  actionLabel = 'Submit Photo',
}: FaceVerificationPhotoPreviewStepProps) {
  return (
    <Container className="gap-5">
      {previewUri ? (
        <View className="items-center">
          <Image
            source={{ uri: previewUri }}
            className="h-64 w-56 rounded-md border border-primary"
          />
        </View>
      ) : null}
      <Text className="mt-4 text-center text-sm text-foreground">
        This photo is required for the system to verify your Authenticity.
      </Text>
      <Text className="mt-2 text-center text-sm text-foreground">
        Please make sure that it is your photograph. Before submitting the photo, please read Our
        Privacy Policy.
      </Text>
      <Text className="mt-2 text-center text-sm font-bold text-destructive">
        [Note: The photo {`won't`} be used for any other purpose except for authenticating your
        Identity for Pension.]
      </Text>
      <Button size="lg" className="mt-6" onPress={onSubmitPress}>
        <Text className="text-base font-bold text-white">{actionLabel}</Text>
      </Button>
      <FooterImg />
    </Container>
  );
}
