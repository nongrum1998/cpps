import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { RegisterPersonalInfoSchema, RegisterPersonalInfoInput } from '../validators';
import { View, Text } from 'react-native';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { useRegistrationStore } from '../store/registration';
import { sha256 } from '@lib/encryption';

/**
 * Step 2 of registration: date of birth and pension bank account number.
 *
 * Senior-friendly: >=16px type throughout, numeric keypads with digit
 * sanitizing (Android IMEs can leak symbols past number-pad), a visible
 * format placeholder for DOB, and a "Back" button that PRESERVES entered
 * data instead of resetting the whole flow.
 */
export const RegistrationPersonalForm = () => {
  const { nextStep, validation, prevStep, saveData, formData } = useRegistrationStore();

  const form = useForm<RegisterPersonalInfoInput>({
    resolver: zodResolver(RegisterPersonalInfoSchema),
    defaultValues: { dob: formData.dob, bank_account_number: formData.bank_account_number },
    mode: 'onTouched',
  });

  const onSubmit = (data: RegisterPersonalInfoInput) => {
    const isValid = RegisterPersonalInfoSchema.safeParse(data).success;

    if (isValid) {
      if (validation?.dob) {
        if (validation?.dob !== data.dob) {
          form.setError('dob', {
            message: 'Date of birth does not match the registered details.',
          });
          return;
        }
      }

      if (validation?.bank_account_number !== sha256(data.bank_account_number)) {
        form.setError('bank_account_number', {
          message: 'Bank account number does not match the registered details.',
        });
        return;
      }

      saveData(data);
      nextStep();
    }
  };

  return (
    <View className="w-full gap-4 py-2">
      {/* 
      <Controller
        control={form.control}
        name="organization"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">Organization</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your organization"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              error={!!form.formState.errors.organization}
            />

            {form.formState.errors.organization && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.organization.message}
              </Text>
            )}
          </View>
        )}
      />
      */}
      <Controller
        control={form.control}
        name="dob"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">Date of Birth</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '').slice(0, 8);

                const formatted = digits
                  .replace(/^(\d{2})(\d)/, '$1-$2')
                  .replace(/^(\d{2})-(\d{2})(\d)/, '$1-$2-$3');

                onChange(formatted);
              }}
              onBlur={onBlur}
              placeholder="DD-MM-YYYY"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              accessibilityLabel="Date of Birth, format year dash month dash day"
              error={!!form.formState.errors.dob}
            />

            {form.formState.errors.dob && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.dob.message}
              </Text>
            )}
            <Text className="mt-1 text-base leading-relaxed text-muted-foreground">
              Use the date of birth of the pensioner receiving the pension.
            </Text>
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="bank_account_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">
                Bank Account Number
              </Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
              onBlur={onBlur}
              placeholder="Enter your Bank Account Number"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              accessibilityLabel="Bank Account Number"
              error={!!form.formState.errors.bank_account_number}
            />
            {form.formState.errors.bank_account_number && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.bank_account_number.message}
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
