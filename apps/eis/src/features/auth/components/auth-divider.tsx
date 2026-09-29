import React from 'react';
import { View, Text } from 'react-native';

export const AuthDivider = () => (
  <View className="my-6 flex-row items-center gap-x-4">
    <View className="h-[1px] flex-1 bg-border" />
    <Text className="text-sm font-medium text-muted-foreground">Or</Text>
    <View className="h-[1px] flex-1 bg-border" />
  </View>
);
