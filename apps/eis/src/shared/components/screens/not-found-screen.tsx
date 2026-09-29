import React from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../ui/button';
import { PAGE_ROUTES } from '@utils/constants/routes';

type NotFoundScreenProps = {
  title?: string;
  message?: string;
};

export const NotFoundScreen = ({
  title = '404 - Page Not Found',
  message = 'The page you are trying to access does not exist. Please try again.',
}: NotFoundScreenProps) => {
  const canGoBack = router.canGoBack();
  return (
    <View className="flex-1 flex-col items-center justify-center gap-4 bg-white p-6">
      <Text className="text-4xl font-bold text-destructive">404</Text>

      <Text className="text-2xl font-bold text-destructive">{title}</Text>

      <Text className="text-center text-graphite">{message}</Text>

      <View className="mt-4 w-full items-center justify-center gap-3">
        <Button
          className="w-full"
          variant={'outline'}
          size={'lg'}
          onPress={() => {
            if (canGoBack) {
              router.back();
            } else {
              router.push(PAGE_ROUTES.HOME);
            }
          }}>
          Go Back
        </Button>
        <Button size={'lg'} className="w-full" onPress={() => router.push(PAGE_ROUTES.HOME)}>
          Home
        </Button>
      </View>
    </View>
  );
};
