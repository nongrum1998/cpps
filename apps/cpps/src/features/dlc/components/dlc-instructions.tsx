import { View, Text } from 'react-native';

import { Alert, AlertTitle, AlertDescription, Icon } from '@components/ui';

/**
 * The props for {@link DLCInstructions}.
 */
type DLCInstructionsProps = {
  /**
   * The verification status message returned by the initialization service.
   * When non-empty, a destructive warning banner is rendered above the steps.
   */
  msg: string;
};

/**
 * Renders the "Instructions" card for the Digital Life Certificate screen.
 *
 * Shows a titled card containing three numbered steps describing how to
 * capture a photo for verification. When `msg` is non-empty, a destructive
 * warning banner is displayed above the steps to surface any registration or
 * status issue returned by the backend.
 *
 * @param props - {@link DLCInstructionsProps}.
 * @returns The instructions card with steps and optional warning banner.
 */
export function DLCInstructions({ msg }: DLCInstructionsProps) {
  return (
    <View className="gap-4 rounded-md border border-gray-200 bg-card p-5">
      <View className="items-center border-b border-gray-200 pb-3">
        <Text className="text-center text-base font-bold uppercase tracking-wide text-foreground">
          Instructions
        </Text>
      </View>

      <View className="gap-3.5">
        <View className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
          <View className="bg-primary/10 mt-0.5 h-6 w-6 items-center justify-center rounded-full">
            <Text className="text-md font-bold text-primary">1</Text>
          </View>
          <Text className="text-md flex-1 leading-5 text-muted-foreground">
            Click on the <Text className="font-semibold text-foreground">Capture Photo</Text> button
            below.
          </Text>
        </View>

        <View className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
          <View className="bg-primary/10 mt-0.5 h-6 w-6 items-center justify-center rounded-full">
            <Text className="text-md font-bold text-primary">2</Text>
          </View>
          <Text className="text-md flex-1 leading-5 text-muted-foreground">
            When the camera opens, look straight into the camera and{' '}
            <Text className="font-semibold text-foreground">blink your eyes</Text>.
          </Text>
        </View>

        <View className="bg-muted/30 flex-row  items-center gap-3 rounded-md border border-gray-200 p-3.5">
          <View className="bg-primary/10 mt-0.5 h-6 w-6 items-center justify-center rounded-full">
            <Text className="text-md font-bold text-primary">3</Text>
          </View>
          <Text className="text-md flex-1 leading-5 text-muted-foreground">
            Wait for the system to process, submit, and verify your photo.
          </Text>
        </View>

        {/* Dynamic Status / Warning Banner */}
        {msg !== '' && (
          <Alert variant={'destructive'}>
            <Icon name="alert-circle" size={18} className="text-destructive" />
            <View className="flex-1">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription className="flex-1">{msg}</AlertDescription>
            </View>
          </Alert>
        )}
      </View>
    </View>
  );
}
