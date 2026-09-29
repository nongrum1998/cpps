import { cn } from '@utils/helpers/cn';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Add01FreeIcons } from '@hugeicons/core-free-icons';

const fabVariants = cva('absolute items-center justify-center rounded-md', {
  variants: {
    variant: {
      primary: 'bg-primary shadow-primary/30',
      secondary: 'bg-secondary shadow-none',
      outline: 'border border-input bg-background shadow-none',
      destructive: 'bg-destructive shadow-destructive/30',
    },
    size: {
      default: 'h-14 w-14 bottom-6 right-6',
      sm: 'h-12 w-12 bottom-5 right-5',
      lg: 'h-16 w-16 bottom-7 right-7',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

/**
 * A reusable Floating Action Button (FAB) component.
 *
 * Renders a circular, elevated button fixed at the bottom-right of the screen,
 * commonly used to trigger a primary action. Built on top of `TouchableOpacity`
 * with variant-based color theming and three size tiers.
 *
 * The component is absolutely positioned by default. Override positioning by
 * passing custom `className` values (e.g., `bottom-4 left-4`).
 *
 * @example
 * ```tsx
 * <FAB icon="add" onPress={() => console.log('FAB pressed')} />
 *
 * <FAB
 *   icon="camera"
 *   variant="secondary"
 *   size="sm"
 *   onPress={handleCapture}
 * />
 *
 * <FAB
 *   icon="trash"
 *   variant="destructive"
 *   size="lg"
 *   className="bottom-4 left-4"
 *   onPress={handleDelete}
 * />
 * ```
 */
interface FABProps extends TouchableOpacityProps, VariantProps<typeof fabVariants> {
  /** Name of the Ionicons icon to display inside the button. */
  icon?: any;
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
}

export const FAB = ({
  icon = Add01FreeIcons,
  onPress,
  className,
  variant = 'primary',
  size = 'default',
  testID,
  ...props
}: FABProps) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 32 : 28;

  /**
   * Determines the icon color based on the variant.
   * Primary and destructive variants use white; secondary uses dark text
   * for contrast against the light background.
   */
  const iconColor = variant === 'secondary' ? '#1e293b' : '#FFFFFF';

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.85}
      className={cn(fabVariants({ variant, size, className }))}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? 'Floating action button'}
      {...props}>
      <HugeiconsIcon icon={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

FAB.displayName = 'FAB';
