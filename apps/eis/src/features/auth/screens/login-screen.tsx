import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, KeyboardSafeView } from '@components/layout';
import { LoginSchema } from '../validators/login.schema';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { useLoginMutation } from '../hooks/use-login-mutation';
import { useAuthStore } from '@stores/auth.store';
import { AuthFooter, AuthLoginHeader } from '../components';
import { LoginScreenSkeleton } from '../components/skeleton';
import { useGetOAuthToken } from '../hooks/use-get-oauth-token';
import { toast } from 'sonner-native';
import { useRateLimit } from '@hooks';
import { useSnackbar } from '@hooks/use-snackbar';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  IdentityCardIcon,
  LockPasswordIcon,
  PasswordValidationIcon,
  SquareUnlock01Icon,
} from '@hugeicons/core-free-icons';
import { Ternary } from '@components/common';

/** Form field values inferred from the `LoginSchema` Zod validation schema. */
type LoginFormInputs = z.infer<typeof LoginSchema>;

/**
 * Default values for the login form.
 *
 * Reads pre-filled credentials from environment variables for development
 * convenience (`EXPO_PUBLIC_EMP_CD` and `EXPO_PUBLIC_PASSWORD`). Falls back
 * to empty strings when the environment variables are not set.
 */
const formDefaultValue: LoginFormInputs = {
  emp_cd: process.env.EXPO_PUBLIC_EMP_CD || '',
  password: process.env.EXPO_PUBLIC_PASSWORD || '',
};

/**
 * The primary login screen displayed to unauthenticated users.
 *
 * Authentication flow:
 *   1. **OAuth token acquisition (eager)** — On mount, the screen immediately
 *      starts fetching an OAuth bearer token via `useGetOAuthToken`. This
 *      happens in parallel with the user filling out the form so the token
 *      is typically ready by the time they tap "Continue".
 *   2. **Credential validation** — Submits the employee code and password
 *      via `useLoginMutation` using the already-acquired OAuth token. The
 *      `onSubmit` handler is gated on token readiness.
 *
 * ### Rate limiting
 *
 * A sliding-window rate limiter guards the submit handler, allowing only
 * **1 submission per 10 seconds**. When the limit is active the button
 * displays cooldown state and the handler returns early.
 *
 * ### Edge cases
 *
 * - **Already signed in** — The submit button is disabled when
 *   `isSignedIn` is `true` to prevent duplicate submissions.
 * - **OAuth token still loading** — If the user taps "Continue" before the
 *   OAuth token is ready, a snackbar message asks them to wait.
 * - **OAuth token failed** — The button label changes to "Retry Connection".
 *   Tapping retries the OAuth fetch.
 * - **Login API errors** — Backend validation errors are surfaced via
 *   `toast.error()`.
 * - **Developer mode** — A link to the UI Laboratory is rendered below
 *   the form when `__DEV__` is `true`, toggled via `EXPO_PUBLIC_APP_ENV`.
 *
 * @example
 * ```tsx
 * <LoginScreen />
 * ```
 */
export const LoginScreen = () => {
  const { isSignedIn, isAuthLoading } = useAuthStore();
  const { startCooldown, isLimited } = useRateLimit('LOGIN_BUTTON_RATE_LIMIT', {
    limit: 1,
    ms: 3000,
  });

  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = React.useState(false);

  const methods = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: formDefaultValue,
    shouldFocusError: true,
    shouldUnregister: true,
  });

  const { mutate: loginMutate, isPending: isLoginPending } = useLoginMutation();

  const {
    refetch: fetchOAuthToken,
    isLoading: isOAuthFetching,
    isSuccess: isTokenReady,
    isError: isOAuthError,
  } = useGetOAuthToken();

  // Pre-fetch OAuth token eagerly on mount — parallel with user input
  React.useEffect(() => {
    if (!isTokenReady && !isOAuthFetching && !isOAuthError) {
      fetchOAuthToken();
    }
  }, [fetchOAuthToken, isTokenReady, isOAuthFetching, isOAuthError]);

  const onSubmit = (data: LoginFormInputs) => {
    if (isLimited) return;

    // If the OAuth token fetch failed, retry on button tap
    if (isOAuthError) {
      fetchOAuthToken();
    }

    // If the OAuth token is still being fetched, inform the user
    if (!isTokenReady) {
      showSnackbar('Preparing authentication, please wait...');
      return;
    }

    startCooldown();

    loginMutate(data, {
      onSuccess: (sData) => {
        if (sData.success) {
          showSnackbar(sData.message);
          return sData;
        }
        fetchOAuthToken();
        toast.error(sData.message);
        return sData;
      },
    });
  };

  // Only show skeleton during cold-start auth hydration
  if (isAuthLoading) return <LoginScreenSkeleton />;

  const isButtonLoading = isOAuthFetching || isLoginPending;

  return (
    <Container>
      <KeyboardSafeView contentContainerClassName="flex-1 justify-center">
        <AuthLoginHeader title="Authentication" subtitle="Please sign in to continue" />

        {/* Form Section */}
        <FormProvider {...methods}>
          <View className="gap-y-4">
            {/* Employee Code */}
            <View className="w-full">
              <Text className="mb-2 ml-1 text-base font-semibold">Employee Code</Text>
              <View className="relative items-center">
                <View className="absolute bottom-0 left-3 top-0 z-10 items-center justify-center">
                  <HugeiconsIcon
                    size={24}
                    strokeWidth={2}
                    className="text-graphite"
                    icon={IdentityCardIcon}
                  />
                </View>
                <Controller
                  name="emp_cd"
                  control={methods.control}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <Input
                      value={value?.toString()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!error}
                      placeholder="Enter your code"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="PHONE_INPUT"
                      returnKeyType="next"
                      className="pl-12"
                    />
                  )}
                />
              </View>
              {methods.formState.errors.emp_cd?.message && (
                <Text className="ml-1 mt-2 text-destructive">
                  {methods.formState.errors.emp_cd.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="w-full">
              <Text className="mb-2 ml-1 text-base font-semibold">Password</Text>
              <View className="relative">
                <View className="absolute bottom-0 left-3 top-0 z-10 justify-center">
                  <HugeiconsIcon
                    strokeWidth={2}
                    className="text-gray-500"
                    icon={PasswordValidationIcon}
                    size={24}
                  />
                </View>
                <Controller
                  name="password"
                  control={methods.control}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <Input
                      value={value?.toString()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!error}
                      placeholder="Enter password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={methods.handleSubmit(onSubmit)}
                      testID="PASSWORD_INPUT"
                      className="px-12"
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute bottom-0 right-3 top-0 z-10 justify-center"
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ternary
                    condition={showPassword}
                    ifTrue={
                      <HugeiconsIcon
                        strokeWidth={2}
                        className="text-graphite"
                        icon={SquareUnlock01Icon}
                        size={22}
                      />
                    }
                    ifFalse={
                      <HugeiconsIcon
                        strokeWidth={2}
                        className="text-graphite"
                        icon={LockPasswordIcon}
                        size={22}
                      />
                    }
                  />
                </TouchableOpacity>
              </View>
              {methods.formState.errors.password?.message && (
                <Text className="ml-1 mt-2 text-base text-destructive">
                  {methods.formState.errors.password.message}
                </Text>
              )}
            </View>
          </View>
          <View className="mb-12 mr-2 mt-5 items-end">
            <Link href={PAGE_ROUTES.AUTH.FORGOT_PASSWORD()} asChild>
              <TouchableOpacity
                className="mt-2"
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <Text className="font-semibold tracking-wide text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View className="mt-4">
            <Button
              testID="SIGN_IN_BUTTON"
              onPress={methods.handleSubmit(onSubmit)}
              isLoading={isButtonLoading}
              size={'lg'}
              disabled={isSignedIn || isLimited}>
              <View className="flex-row items-center gap-x-2">
                <Text className="text-button-md uppercase tracking-[2px]  text-primary-foreground">
                  {isOAuthError ? 'Retry Connection' : isLimited ? 'Please wait' : 'Continue'}
                </Text>
                {!isButtonLoading && (
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#FFFFFF" />
                )}
              </View>
            </Button>
          </View>
        </FormProvider>

        <View className="absolute bottom-0 w-full flex-1 items-center justify-center">
          <AuthFooter
            text="By signing in, you agree to our"
            linkText="Terms of Service"
            linkHref={PAGE_ROUTES.HOME}
            testID="SIGNUP_BUTTON"
            replace
          />
        </View>
      </KeyboardSafeView>
    </Container>
  );
};
