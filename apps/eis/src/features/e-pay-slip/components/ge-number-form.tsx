import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  HelpCircleIcon,
  DocumentAttachmentIcon,
  HashtagIcon,
} from '@hugeicons/core-free-icons';
import { Container, KeyboardSafeView } from '@components/layout';
import { Input, Button } from '@components/ui';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddGeNumberSchema } from '../validators';
import { env } from '@utils/env';

const isDevelopment = env.NODE_ENV === 'development';

interface GeNumberFormProps {
  /**
   * Callback invoked with the trimmed GE number when the user taps
   * "Fetch E-Pay Slip" and the value passes schema validation. The parent
   * owns the fetch side effect and any navigation.
   */
  onSubmit: (geNumber: string) => void;
  /**
   * Inline validation / fetch error message rendered below the input.
   * When present the message is shown in the destructive (red) style and
   * the submit button remains enabled only if the current input is valid.
   */
  error?: string | null;
}

/**
 * Prefill value for the GE number field. In development builds a valid
 * sample GE number is pre-populated to speed up manual testing; in
 * production the field starts empty.
 */
const defaultValues = { ge_number: isDevelopment ? process.env.EXPO_PUBLIC_GE_NO || '' : '' };

/**
 * Entry form shown when the signed-in user has no GE number stored.
 *
 * Collects the user's Government Employee (GE) number inside a card
 * layout that follows the E-Pay Slip design mockup: a document badge
 * graphic, header copy, an input field with a trailing hashtag icon and
 * a "Fetch E-Pay Slip" button with an arrow affordance, plus a disabled
 * "Forgot your GE Number?" help row.
 *
 * Form state is managed with react-hook-form backed by `AddGeNumberSchema`
 * (zod): the field must be all digits, at least 7 characters, and is
 * trimmed before submission. The submit button is disabled until the
 * schema validates; pressing it calls `onSubmit` with the trimmed value.
 *
 * @param props.onSubmit - Callback receiving the validated, trimmed GE
 *   number when the fetch action is pressed.
 * @param props.error - Optional inline error message displayed under the
 *   input (e.g. a fetch failure or a GE number not found).
 * @returns The rendered E-Pay Slip entry form.
 *
 * @remarks
 * - The input does not strip characters; validation is handled entirely
 *   by the zod schema and reflected through react-hook-form state.
 * - In development the field is prefilled with a sample GE number
 *   (`1069587`) via `defaultValues`.
 * - The "Forgot your GE Number?" help action is intentionally disabled
 *   pending a future support flow.
 */
export const GeNumberForm = ({ onSubmit, error }: GeNumberFormProps) => {
  const form = useForm({
    resolver: zodResolver(AddGeNumberSchema),
    defaultValues,
  });

  const watchGeNumber = useWatch({ control: form.control, name: 'ge_number' });

  return (
    <Container className="flex-1">
      <KeyboardSafeView contentContainerClassName="flex-1 justify-center">
        {/* Graphic Element */}
        <View className="mb-8 w-full flex-row justify-center">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-primary/5">
            <HugeiconsIcon icon={DocumentAttachmentIcon} size={52} className="text-primary" />
          </View>
        </View>

        {/* Header Text */}
        <View className="mb-8 items-center">
          <Text className="mb-2 text-2xl font-bold">E-Pay Slip</Text>
          <Text className="max-w-[280px] text-center text-base text-graphite">
            Please enter your GE Number to fetch your e-pay slip.
          </Text>
        </View>

        {/* Input Card */}
        <View className="rounded-md border border-border bg-white p-4">
          <Text className="mb-1.5 text-sm font-medium">GE Number</Text>

          <Controller
            control={form.control}
            name="ge_number"
            render={({ field }) => (
              <View className="relative mb-1.5 justify-center">
                <Input
                  placeholder="Enter GE number"
                  // placeholderTextColor="#9ca3af"
                  placeholderClassName="text-graphite"
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                  {...field}
                  onChangeText={(value) => field.onChange(value)}
                />
                <View className="pointer-events-none absolute right-4 justify-center">
                  <HugeiconsIcon
                    icon={HashtagIcon}
                    size={20}
                    className={!!watchGeNumber ? 'text-primary' : 'text-graphite'}
                  />
                </View>
              </View>
            )}
          />

          {error ? <Text className="mb-2 text-xs text-destructive">{error}</Text> : null}

          <Text className="mb-5 text-xs text-graphite">
            Your 8-digit unique Government Employee ID.
          </Text>

          <Button
            activeOpacity={0.8}
            disabled={!form.formState.isValid}
            size={'lg'}
            onPress={() => onSubmit(form.getValues('ge_number'))}
            accessibilityRole="button">
            <Text className="mr-2 text-sm font-semibold uppercase tracking-wide text-white">
              Fetch E-Pay Slip
            </Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="text-white" />
          </Button>
        </View>

        {/* Help Section */}
        <View className="mt-8 items-center">
          <TouchableOpacity
            disabled
            className="flex-row items-center justify-center disabled:opacity-50"
            activeOpacity={0.7}>
            <View className="mr-2">
              <HugeiconsIcon icon={HelpCircleIcon} size={20} className="text-primary" />
            </View>
            <Text className="text-base font-medium text-primary">Forgot your GE Number?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardSafeView>
    </Container>
  );
};
