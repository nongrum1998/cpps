import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';

interface GovtHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export const GovtHeader = ({ title, subtitle, badge, className }: GovtHeaderProps) => (
  <View className={cn('mb-8 items-center gap-y-2', className)}>
    <View className="mb-3 h-[70px] w-[70px] items-center justify-center opacity-80">
      <Text className="text-7xl">🏛️</Text>
    </View>
    <Text className="text-center text-[11px] text-muted-foreground">Government of India</Text>
    <Text className="text-center text-2xl font-semibold">{title}</Text>
    {subtitle && <Text className="text-center text-sm text-muted-foreground">{subtitle}</Text>}
    {badge && (
      <View className="mt-4 rounded-md bg-graphite/20 px-4 py-1">
        <Text className="text-xs font-bold uppercase text-charcoal">{badge}</Text>
      </View>
    )}
  </View>
);
