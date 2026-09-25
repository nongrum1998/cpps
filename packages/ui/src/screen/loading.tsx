import { ActivityIndicator, Text, View } from 'react-native';

export const LoadingScreen = () => {
  return (
    <View className={'flex-1 items-center justify-center gap-4'}>
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-lg font-bold uppercase tracking-wider text-primary">Loading</Text>
    </View>
  );
};
