import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { RegisterPasswordInput, RegisterPasswordSchema } from '../validators';
import { View, Text, Pressable } from 'react-native';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { useRegistrationStore } from '../store/registration';
import { useState } from 'react';
import { Icon } from '@components/ui/icon';
import { formatPassword } from '@lib/encryption';

/**
 * Step 3 of registration: create a login password.
 *
 * Senior-friendly: >=16px type throughout, show/hide toggles on both
 * fields, and a "Back" button that PRESERVES entered data instead of
 * resetting the whole flow.
 *
 * Note: `password` is seeded from the store so returning to this step
 * keeps it; `confirm_password` is intentionally always blank — the user
 * must re-type it to confirm.
 */
export const RegistrationPasswordForm = () => {
  const { nextStep, prevStep, saveData } = useRegistrationStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterPasswordInput>({
    resolver: zodResolver(RegisterPasswordSchema),
    defaultValues: { password: '', confirm_password: '' },
    mode: 'onTouched',
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = (data: RegisterPasswordInput) => {
    saveData({ password: formatPassword(data.password) });
    nextStep();
  };

  return (
    <View className="gap-4 py-2">
      <Controller
        control={form.control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">Password</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <View className="relative justify-center">
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your Password"
                autoCapitalize="none"
                autoCorrect={false}
                className="pr-12 text-base"
                accessibilityLabel="Password"
                error={!!form.formState.errors.password}
              />

              <Pressable
                onPress={togglePasswordVisibility}
                hitSlop={8}
                className="absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center p-1"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <Icon name="eye-open" /> : <Icon name="eye-close" size={20} />}
              </Pressable>
            </View>
            {form.formState.errors.password && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="confirm_password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">Confirm Password</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <View className="relative justify-center">
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Confirm your Password"
                autoCapitalize="none"
                autoCorrect={false}
                error={!!form.formState.errors.confirm_password}
                className="pr-12 text-base"
                accessibilityLabel="Confirm Password"
              />
              <Pressable
                onPress={togglePasswordVisibility}
                hitSlop={8}
                className="absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center p-1"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <Icon name="eye-open" /> : <Icon name="eye-close" size={20} />}
              </Pressable>
            </View>
            {form.formState.errors.confirm_password && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.confirm_password.message}
              </Text>
            )}
          </View>
        )}
      />
      <View className="gap-2">
        <View className="w-full flex-row items-center gap-3">
          {/* Previous Step Button — keeps all entered data */}
          <Button variant="outline" size="lg" onPress={prevStep} className="flex-1">
            Back
          </Button>

          {/* Next Step Button */}
          <Button
            isLoading={form.formState.isSubmitting}
            size="lg"
            disabled={!form.formState.isValid}
            onPress={form.handleSubmit(onSubmit)}
            className="flex-1">
            Next
          </Button>
        </View>
      </View>
    </View>
  );
};
