import { cn } from '@utils/helpers/cn';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Container } from '../layout/container';

export const LoadingScreen = () => {
  return (
    <Container className={cn('flex-1 items-center justify-center')}>
      <ActivityIndicator size="large" className="text-primary" />
    </Container>
  );
};
