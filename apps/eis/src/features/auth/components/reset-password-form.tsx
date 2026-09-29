import React from 'react';
import { View, Text } from 'react-native';
import { FormProvider, Controller } from 'react-hook-form';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { cn } from '@utils/helpers/cn';
import { useResetPassword } from '../hooks/use-reset-password';

export const ResetPasswordForm = () => {
  const {
    status,
    phone_no,
    passwordMethods,
    otpMethods,
    sendOtpMutation,
    resetPasswordMutation,
    onPasswordSubmit,
    onOtpSubmit,
  } = useResetPassword();

  return (
    <View className="w-full">
      {status === 'INPUT_PASSWORD' && (
        <FormProvider {...passwordMethods}>
          <Controller
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View className="my-2 w-full">
                <Text
                  className={cn(
                    'mb-2 ml-1',
                    error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                  )}>
                  New Password
                </Text>
                <Input
                  value={value?.toString()}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  secureTextEntry
                  error={!!error}
                />
                {error && (
                  <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            name="confirm_password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <View className="my-2 w-full">
                <Text
                  className={cn(
                    'mb-2 ml-1',
                    error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                  )}>
                  Confirm Password
                </Text>
                <Input
                  value={value?.toString()}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  secureTextEntry
                  error={!!error}
                />
                {error && (
                  <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                )}
              </View>
            )}
          />

          <Button
            title="Send OTP"
            onPress={passwordMethods.handleSubmit(onPasswordSubmit)}
            isLoading={sendOtpMutation.isPending}
          />
        </FormProvider>
      )}

      {status === 'INPUT_OTP' && (
        <FormProvider {...otpMethods}>
          <View className="mb-4">
            <Text className="mb-6 text-center text-sm text-muted-foreground">
              OTP sent to {phone_no}
            </Text>

            <Controller
              name="otp"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    Enter OTP
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <Button
            title="Reset Password"
            onPress={otpMethods.handleSubmit(onOtpSubmit)}
            isLoading={resetPasswordMutation.isPending}
          />
        </FormProvider>
      )}
    </View>
  );
};
