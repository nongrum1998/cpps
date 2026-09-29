import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Button, Input } from '@components/ui';
import { cn } from '@utils/helpers/cn';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '@components/layout/container';
import { SignUpSchema } from '../validators/signup.schema';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { useSignUpMutation } from '../hooks/use-sign-up-mutation';
import { KeyboardSafeView } from '@components/layout';
import { AuthTermsText, AuthDivider, AuthFooter, AuthHeader } from '../components';

type SignUpFormInputs = z.infer<typeof SignUpSchema>;

const defaultValues: SignUpFormInputs = {
  first_name: '',
  last_name: '',
  phone_no: '',
  password: '',
  confirm_password: '',
};

export const SignUpScreen = () => {
  const signUpMutation = useSignUpMutation();

  const methods = useForm<SignUpFormInputs>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const onSubmit = (data: SignUpFormInputs) => signUpMutation.mutate(data);

  return (
    <Container>
      <KeyboardSafeView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          className="px-6">
          <AuthHeader
            emoji="🚀"
            title="Create account"
            subtitle="Provide your details to register."
            iconContainerClassName="bg-blue-50"
          />

          <FormProvider {...methods}>
            <View className="w-full gap-y-2">
              <View className="flex-row justify-between gap-x-2">
                <View className="flex-1">
                  <Controller
                    name="first_name"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <View className="my-2 w-full">
                        <Text
                          className={cn(
                            'mb-2 ml-1',
                            error
                              ? 'text-sm text-destructive'
                              : 'text-sm font-medium text-foreground/70'
                          )}>
                          First name
                        </Text>
                        <Input
                          value={value?.toString()}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="John"
                          error={!!error}
                          testID="FIRST_NAME_INPUT"
                        />
                        {error && (
                          <Text className="ml-1 mt-2 text-xs text-destructive">
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    name="last_name"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <View className="my-2 w-full">
                        <Text
                          className={cn(
                            'mb-2 ml-1',
                            error
                              ? 'text-sm text-destructive'
                              : 'text-sm font-medium text-foreground/70'
                          )}>
                          Last name
                        </Text>
                        <Input
                          value={value?.toString()}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Doe"
                          error={!!error}
                          testID="LAST_NAME_INPUT"
                        />
                        {error && (
                          <Text className="ml-1 mt-2 text-xs text-destructive">
                            {error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>

              <Controller
                name="phone_no"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <View className="my-2 w-full">
                    <Text
                      className={cn(
                        'mb-2 ml-1',
                        error
                          ? 'text-sm text-destructive'
                          : 'text-sm font-medium text-foreground/70'
                      )}>
                      Phone Number
                    </Text>
                    <Input
                      value={value?.toString()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="9876543210"
                      keyboardType="phone-pad"
                      error={!!error}
                      testID="PHONE_NUMBER_INPUT"
                    />
                    {error && (
                      <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <View className="my-2 w-full">
                    <Text
                      className={cn(
                        'mb-2 ml-1',
                        error
                          ? 'text-sm text-destructive'
                          : 'text-sm font-medium text-foreground/70'
                      )}>
                      Password
                    </Text>
                    <Input
                      value={value?.toString()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Create a password"
                      secureTextEntry
                      error={!!error}
                      testID="PASSWORD_INPUT"
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
                        error
                          ? 'text-sm text-destructive'
                          : 'text-sm font-medium text-foreground/70'
                      )}>
                      Confirm Password
                    </Text>
                    <Input
                      value={value?.toString()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Create a password"
                      secureTextEntry
                      error={!!error}
                      testID="CONFIRM_PASSWORD_INPUT"
                    />
                    {error && (
                      <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <AuthTermsText />

              <Button
                testID="CREATE_ACCOUNT_BUTTON"
                title="Create account"
                onPress={methods.handleSubmit(onSubmit)}
                isLoading={signUpMutation.isPending}
              />

              <AuthDivider />
            </View>
          </FormProvider>

          <AuthFooter
            text="Already have an account?"
            linkText="Sign in"
            linkHref={PAGE_ROUTES.AUTH.LOGIN}
            className="my-8"
          />
        </ScrollView>
      </KeyboardSafeView>
    </Container>
  );
};
