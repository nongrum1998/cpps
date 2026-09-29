import { View } from 'react-native';

export const TricolorStrip = () => (
  <View className="h-[3px] w-full flex-row">
    <View className="flex-1 bg-[#FF9933]" />
    <View className="flex-1 bg-white" />
    <View className="flex-1 bg-[#138808]" />
  </View>
);
