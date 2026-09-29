import { View, Text } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@components/ui';
import { PAGE_ROUTES } from '@utils/constants';
import { Container } from '@components/layout';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ToolsIcon } from '@hugeicons/core-free-icons';

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export const UnderDevelopment = ({
  title = 'Under Development',
  message = "We're currently working hard on this feature. Stay tuned!",
  showBackButton = true,
}: UnderDevelopmentProps) => {
  const router = useRouter();

  return (
    <Container className="flex-1 items-center justify-center">
      <View className="mb-6 items-center justify-center rounded-md bg-primary p-6">
        <HugeiconsIcon icon={ToolsIcon} className="text-white" size={48} />
      </View>

      <Text className="mb-4 text-center text-2xl font-bold text-foreground">{title}</Text>

      <Text className="mb-8 text-center text-base leading-6 text-graphite">{message}</Text>

      {showBackButton && (
        <Button
          variant={'outline'}
          onPress={() => {
            const canGoBack = router.canGoBack();
            if (canGoBack) {
              router.back();
            } else {
              router.push(PAGE_ROUTES.HOME);
            }
          }}>
          Go Back
        </Button>
      )}
    </Container>
  );
};
