import { View, Text } from 'react-native';

/** Renders a label-value pair in a horizontal row layout. Used in detail screens to display field data. */
export const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-2 flex-row justify-between">
    <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
    <Text className="text-sm font-semibold text-foreground">{value}</Text>
  </View>
);
