import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';

interface AuthHeaderProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  subtitle: string;
  containerClassName?: string;
  iconContainerClassName?: string;
}

export const AuthHeader = ({
  icon,
  emoji,
  title,
  subtitle,
  containerClassName,
  iconContainerClassName,
}: AuthHeaderProps) => (
  <View className={cn('mb-10 items-center', containerClassName)}>
    <View
      className={cn(
        'mb-6 h-16 w-16 items-center justify-center rounded-md bg-primary',
        iconContainerClassName
      )}>
      {icon ? icon : emoji ? <Text className="text-3xl">{emoji}</Text> : null}
    </View>
    <Text className="text-center text-4xl font-semibold">{title}</Text>
    <Text className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</Text>
  </View>
);
