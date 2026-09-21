import { cn } from '@utils/helpers/cn';
import { ActivityIndicator, Text } from 'react-native';
import { Container } from '../layout/container';

export const LoadingScreen = () => {
  return (
    <Container className={cn('flex-1 items-center justify-center gap-4')}>
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-lg font-bold uppercase tracking-wider text-primary">Loading</Text>
    </Container>
  );
};
