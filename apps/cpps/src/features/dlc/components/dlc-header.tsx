import { View, Text } from 'react-native';

/**
 * Renders the header block for the Digital Life Certificate screen.
 *
 * Presents a static introduction consisting of a small "Self Verification"
 * badge, the "Digital Life Certificate" title, and a short helper subtitle
 * describing the identity-verification purpose of the screen.
 *
 * @returns The header column with badge, title, and subtitle.
 */
export function DLCHeader() {
  return (
    <View className="gap-2">
      <View className="bg-primary/10 self-start py-1">
        <Text className="text-xs font-bold uppercase tracking-wider text-primary">
          Self Verification
        </Text>
      </View>

      <Text className="text-2xl font-extrabold tracking-tight text-foreground">
        Digital Life Certificate
      </Text>

      <Text className="text-sm font-medium text-muted-foreground">
        Verify your identity with a photo
      </Text>
    </View>
  );
}
