import * as React from 'react';
import { View, ViewProps, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers/cn';

/**
 * Card variant styles following HP design system.
 *
 * - **default**: No border, `shadow-sm` elevation — for cards inside section bands
 * - **bordered**: `border border-border`, `shadow-sm` — for standalone cards on canvas
 * - **elevated**: No border, `shadow-lg` — for modal-like cards, floating panels
 * - **flat**: No border, no shadow — for cards inside other cards
 */
const cardVariants = cva('rounded-md bg-card shadow-sm dark:bg-gray-800', {
  variants: {
    variant: {
      default: '',
      bordered: 'border border-border dark:border-gray-700',
      elevated: 'shadow-lg',
      flat: 'shadow-none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  className?: string;
}

/**
 * Card container following HP design system.
 *
 * Uses `{rounded.xl}` (16px) corners, `{colors.canvas}` background,
 * and configurable elevation. Supports four variants:
 *
 * - `default` — clean card with `shadow-sm`
 * - `bordered` — card with `border border-border` for visual separation
 * - `elevated` — elevated card with `shadow-lg` for modals/floating panels
 * - `flat` — no shadow, for nested card contexts
 *
 * @example
 * ```tsx
 * <Card variant="bordered">
 *   <CardHeader>
 *     <CardTitle>Product Name</CardTitle>
 *   </CardHeader>
 *   <CardContent>Details here</CardContent>
 *   <CardFooter>
 *     <Button title="Buy now" onPress={handleBuy} />
 *   </CardFooter>
 * </Card>
 * ```
 */
const Card = React.forwardRef<View, CardProps>(({ className, variant, ...props }, ref) => (
  <View ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
));

Card.displayName = 'Card';

const CardHeader = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card title using `{typography.display-xs}` (20px/500) weight per HP spec.
 */
const CardTitle = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn('text-xl leading-tight', className)} {...props} />
  )
);

CardTitle.displayName = 'CardTitle';

/**
 * Card description using muted foreground color.
 */
const CardDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-row items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
