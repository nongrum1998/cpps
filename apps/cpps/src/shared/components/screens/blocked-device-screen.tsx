import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@components/ui';
import { Container } from '@components/layout';

/**
 * Full-screen state shown when the device is jailbroken/rooted or has a
 * debugger attached in production.
 *
 * Renders a centered security-block icon with a title and explanation. There
 * are no action buttons: a compromised device must not proceed into the app,
 * and the screen is intentionally dismiss-free. Wrapped in a `SafeAreaView`
 * so content avoids notches on both platforms.
 *
 * @example
 * <BlockedDeviceScreen />
 */
export const BlockedDeviceScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Container scrollable={false} centered>
        <View className="items-center gap-y-5 px-6">
          <View className="bg-destructive/20 h-24 w-24 items-center justify-center rounded-md">
            <Icon name="security-block" size={48} color="#EF4444" />
          </View>

          <Text className="text-center text-3xl font-bold tracking-widest text-foreground">
            Device Not Verified
          </Text>

          <Text className="text-center text-base leading-6 text-muted-foreground">
            We could not verify the security of this device. Access to this app is restricted on
            jailbroken, rooted, or debugged devices to protect your account.
          </Text>
        </View>
      </Container>
    </SafeAreaView>
  );
};
