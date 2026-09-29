import { View, Text } from 'react-native';

export const AuthTermsText = () => (
  <View className="p-2">
    <Text className="text-xs text-muted-foreground">
      By creating an account, you agree to our{' '}
      <Text className="text-xs font-medium text-primary">Terms of Service</Text> and{' '}
      <Text className="text-xs font-medium text-primary">Privacy Policy</Text>.
    </Text>
  </View>
);
