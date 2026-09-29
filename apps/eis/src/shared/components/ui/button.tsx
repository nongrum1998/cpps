import { cn } from '@utils/helpers/cn';
import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button variant styles following HP design system.
 *
 * - **primary**: HP Electric Blue filled CTA (`{colors.primary}`). The lone signal action.
 * - **ink**: Black filled CTA (`{colors.ink}`). Used where blue would clash with imagery.
 * - **outline**: Blue-text outlined CTA. `{colors.primary}` text + border on `{colors.canvas}`.
 * - **outline-ink**: Black-text outlined CTA. `{colors.ink}` text + border on `{colors.canvas}`.
 * - **link**: Inline blue link with no border/shadow. `{colors.primary}` text, `{typography.link-md}`.
 * - **destructive**: Red (`--destructive`) filled for delete/danger actions.
 * - **ghost**: Transparent background, subtle text. For tiered UI actions.
 *
 * All filled variants use 4px radius (`{rounded.md}`), 44px height, and
 * `{typography.button-md}` (uppercase, 0.7px tracking) for labels.
 */
export const buttonVariants = cva(
  'flex-row disabled:opacity-70 items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        ink: 'bg-ink',
        outline: 'border border-primary bg-background dark:bg-gray-900',
        'outline-ink': 'border border-ink bg-background dark:bg-gray-900',
        link: 'bg-background dark:bg-gray-900',
        destructive: 'bg-destructive',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4',
        lg: 'h-14 px-8',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

/**
 * Determines the ActivityIndicator color and text color for each variant.
 */
function getVariantColors(variant: string): {
  spinnerColor: string;
  textClass: string;
} {
  switch (variant) {
    case 'outline':
      return { spinnerColor: '#024ad8', textClass: 'text-primary' };
    case 'outline-ink':
      return { spinnerColor: '#1a1a1a', textClass: 'text-ink' };
    case 'link':
      return { spinnerColor: '#024ad8', textClass: 'text-primary' };
    case 'ghost':
      return { spinnerColor: '#1a1a1a', textClass: 'text-foreground' };
    default:
      // primary, ink, destructive — all use white text
      return { spinnerColor: '#FFFFFF', textClass: 'text-primary-foreground' };
  }
}

interface ButtonProps extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
  /** Label text rendered inside the button. Default button labels are uppercase per HP spec. */
  title?: string;
  /** Show a loading spinner in place of the label. */
  isLoading?: boolean;
  /** Minimum loading duration in ms to prevent flicker. Defaults to 2000ms. */
  loadingDelay?: number;
  /** Child elements replace the text label when present. */
  children?: React.ReactNode;
}

/**
 * A design-system button following the HP component spec.
 *
 * Filled buttons (`primary`, `ink`, `destructive`) render white text.
 * Outlines and ghost use the corresponding foreground color.
 * `link` renders as inline blue text with no border or shadow.
 *
 * @example
 * ```tsx
 * <Button title="Buy now" onPress={handleBuy} />
 * <Button title="Learn more" variant="outline" onPress={handleLearn} />
 * <Button title="Cancel" variant="link" onPress={handleCancel} />
 * ```
 */
export const Button = ({
  onPress,
  className,
  title,
  variant = 'primary',
  size = 'default',
  isLoading,
  testID,
  children,
  ...props
}: ButtonProps) => {
  const isDisabled = isLoading || props.disabled;
  const colors = getVariantColors(variant!);

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={isLoading || isDisabled}
      activeOpacity={0.7}
      className={cn(buttonVariants({ variant, size, className }), isLoading && 'opacity-70')}
      accessibilityRole="button"
      {...props}>
      {isLoading ? (
        <ActivityIndicator color={colors.spinnerColor} />
      ) : children ? (
        typeof children === 'string' ? (
          // Wrap raw string children in <Text> — RN requires text nodes
          // to live inside a <Text> component or they are dropped silently
          <Text
            className={cn(
              'text-center text-button-md font-bold uppercase tracking-widest',
              colors.textClass,
              className
            )}>
            {children}
          </Text>
        ) : (
          children
        )
      ) : (
        <Text
          className={cn(
            'text-button-md uppercase tracking-widest',
            colors.textClass,
            variant === 'link' && 'underline',
            className
          )}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

Button.displayName = 'Button';
