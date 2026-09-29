import React, { memo } from 'react';
import { Button } from '@components/ui/button';
import { useRateLimit } from '@hooks';

/**
 * Props for the {@link CreateLeaveSubmitButton} component.
 */
interface CreateLeaveSubmitButtonProps {
  /** React Hook Form submission handler (wrapped via `handleSubmit`). */
  onPress: () => void;
  /** Whether any form field has been touched (`formState.isDirty`). */
  isDirty: boolean;
  /** Whether the mutation is currently in flight. */
  isPending?: boolean;
  /** Rate-limit key to isolate countdown state per-screen. */
  rateLimitKey?: string;
  /** Text shown while the mutation is in flight. */
  loadingText?: string;
  /** Default label shown when not rate-limited and not pending. */
  label?: string;
}

/**
 * Submit button for leave forms with built-in rate limiting.
 *
 * Isolates the rate-limit hook (which ticks every second to update the
 * countdown display) inside this small component so the rest of the form
 * does not re-render on each tick.
 *
 * @example
 * ```tsx
 * // Create mode
 * <CreateLeaveSubmitButton
 *   onPress={methods.handleSubmit(onSubmit)}
 *   isDirty={methods.formState.isDirty}
 *   isPending={isPending}
 * />
 *
 * // Update mode
 * <CreateLeaveSubmitButton
 *   onPress={methods.handleSubmit(onSubmit)}
 *   isDirty={methods.formState.isDirty}
 *   isPending={isPending}
 *   rateLimitKey="UPDATE_LEAVE_SUBMIT"
 *   label="Update Leave"
 *   loadingText="Updating Leave..."
 * />
 * ```
 */
export const CreateLeaveSubmitButton = memo(
  ({
    onPress,
    isDirty,
    isPending,
    rateLimitKey = 'CREATE_LEAVE_SUBMIT',
    loadingText = 'Creating Leave...',
    label = 'Create Leave',
  }: CreateLeaveSubmitButtonProps) => {
    const { isLimited, secondsRemaining } = useRateLimit(rateLimitKey, {
      limit: 1,
      ms: 5000,
    });

    return (
      <Button
        size={'lg'}
        testID="LEAVE_SUBMIT_BUTTON"
        title={isPending ? loadingText : isLimited ? `Please wait ${secondsRemaining}` : label}
        onPress={onPress}
        disabled={isPending || isLimited || !isDirty}
      />
    );
  }
);

CreateLeaveSubmitButton.displayName = 'CreateLeaveSubmitButton';
