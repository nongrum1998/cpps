import { View, Text } from 'react-native';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Button, Icon } from '@components/ui';
import { PAGE_ROUTES } from '@utils/constants';
import { Container } from '@components/layout';

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
  const { navigate, back } = useSafeNavigation();

  return (
    <Container className="flex-1 items-center justify-center">
      <View className="mb-6 items-center justify-center rounded-md bg-primary p-6">
        <Icon name="tool" className="text-white" size={48} />
      </View>

      <Text className="mb-4 text-center text-2xl font-bold text-foreground">{title}</Text>

      <Text className="text-graphite mb-8 text-center text-base leading-6">{message}</Text>

      {showBackButton && (
        <Button
          variant={'outline'}
          onPress={() => {
            const wentBack = back();
            if (!wentBack) {
              navigate(PAGE_ROUTES.HOME);
            }
          }}>
          Go Back
        </Button>
      )}
    </Container>
  );
};
