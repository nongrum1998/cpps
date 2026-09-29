import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@utils/helpers/cn';
import { Container } from '../layout/container';
import { Button } from '@components/ui';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FileNotFoundIcon } from '@hugeicons/core-free-icons';

interface EmptyScreenProps {
  title: string;
  refresh?: () => void;
  message?: string;
  refreshLabel?: string;
}

export const EmptyScreen = ({
  title,
  refresh,
  message,
  refreshLabel = 'Refresh',
}: EmptyScreenProps) => {
  return (
    <Container className={cn('flex-1 items-center justify-center px-6')}>
      <View className={cn('mb-6 h-24 w-24 items-center justify-center rounded-md bg-primary')}>
        <HugeiconsIcon icon={FileNotFoundIcon} className="text-white" size={48} />
      </View>

      <Text className={cn('mb-2 text-center text-2xl font-bold text-foreground')}>{title}</Text>

      {message && (
        <Text className={cn('mb-8 text-center text-base leading-6 text-graphite')}>{message}</Text>
      )}

      {!message && <View className={cn('mb-8')} />}

      <Button onPress={() => refresh?.()} activeOpacity={0.8}>
        {refreshLabel}
      </Button>
    </Container>
  );
};

EmptyScreen.displayName = 'EmptyScreen';
