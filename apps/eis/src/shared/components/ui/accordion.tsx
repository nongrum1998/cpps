import * as React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
  measure,
  useAnimatedRef,
  runOnUI,
} from 'react-native-reanimated';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ChevronDownIcon } from '@hugeicons/core-free-icons';
import { cn } from '../../utils/helpers/cn';

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

export const Accordion = ({
  children,
  value,
  onValueChange,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) => (
  <AccordionContext.Provider value={{ value, onValueChange }}>
    <View className={cn('w-full', className)}>{children}</View>
  </AccordionContext.Provider>
);

/**
 * AccordionItem wraps each row with HP FAQ styling:
 * `{rounded.lg}` (8px) container, `{colors.hairline}` divider between rows,
 * and `{spacing.lg} {spacing.xl}` internal padding.
 */
export const AccordionItem = ({
  children,
  value: itemValue,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => {
  const { value: activeValue } = React.useContext(AccordionContext);
  const isOpen = activeValue === itemValue;

  return (
    <View
      className={cn(
        'border-b border-border bg-card px-6 py-5 first:rounded-t-lg last:rounded-b-lg last:border-b-0 dark:border-gray-700 dark:bg-gray-800',
        className
      )}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { isOpen, value: itemValue })
          : child
      )}
    </View>
  );
};

export const AccordionTrigger = ({
  children,
  isOpen,
  value: itemValue,
  className,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  value?: string;
  className?: string;
}) => {
  const { onValueChange, value: activeValue } = React.useContext(AccordionContext);

  const rotation = useDerivedValue(() => {
    return withTiming(isOpen ? 180 : 0, { duration: 300 });
  });

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (onValueChange && itemValue) {
          onValueChange(activeValue === itemValue ? '' : itemValue);
        }
      }}
      className={cn('flex-row items-center justify-between py-4', className)}>
      <Text className="flex-1 text-base font-medium">{children}</Text>
      <Animated.View style={arrowStyle}>
        <HugeiconsIcon icon={ChevronDownIcon} size={18} color="#636363" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AccordionContent = ({
  children,
  isOpen,
  className,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}) => {
  const aref = useAnimatedRef<View>();
  const heightValue = useSharedValue(0);

  // Smooth height transition using Reanimated
  // This is much smoother than LayoutAnimation as it stays on the UI thread
  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: heightValue.value === 0 ? 0 : 1,
    overflow: 'hidden',
  }));

  React.useEffect(() => {
    if (isOpen) {
      // Small delay to allow layout calculation
      runOnUI(() => {
        const measured = measure(aref);
        if (measured) {
          heightValue.value = withTiming(measured.height, { duration: 300 });
        }
      })();
    } else {
      heightValue.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen]);

  return (
    <Animated.View style={animatedStyle}>
      <View
        ref={aref}
        className={cn('pb-4 pt-0', className)}
        style={{ position: 'absolute', width: '100%' }}>
        {children}
      </View>
    </Animated.View>
  );
};
