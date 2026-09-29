import React, { useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Container } from '@components/layout/container';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@utils/helpers/cn';
import { Button, Input, toast } from '@components/ui';
import { SectionHeader } from '@components/common/section-header';
import { EditTaxSkeleton } from '../components/skeleton';
import { useEmployeeTax, useUpdateTaxDetail } from '../hooks';
import { UpdateTaxSchema, UpdateTaxInput } from '../validators/tax.validator';
import { router } from 'expo-router';

export default function EditTaxDetailScreen() {
  const { data, isLoading } = useEmployeeTax();
  const updateMutation = useUpdateTaxDetail();

  const methods = useForm<UpdateTaxInput>({
    resolver: zodResolver(UpdateTaxSchema) as any,
    defaultValues: {
      regime: 'NEW',
      deductions80C: 0,
      deductions80D: 0,
      hraExemption: 0,
      ltaExemption: 0,
      homeLoanInterest: 0,
      npsContribution: 0,
    },
  });

  const { control, handleSubmit, reset, formState } = methods;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (data) {
      reset({
        regime: data.regime,
        deductions80C: data.deductions80C,
        deductions80D: data.deductions80D,
        hraExemption: data.hraExemption,
        ltaExemption: data.ltaExemption,
        homeLoanInterest: data.homeLoanInterest,
        npsContribution: data.npsContribution,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: UpdateTaxInput) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Tax Details Updated', {
        description: 'The employee tax details have been saved successfully.',
      });
      router.back();
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err?.message || 'Could not update tax details.',
      });
    }
  };

  if (isLoading) return <EditTaxSkeleton />;

  return (
    <Container className="flex-1">
      <FormProvider {...methods}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <SectionHeader title="Tax Regime" />
            <Text className="mb-3 text-xs text-gray-500">
              Select the tax regime applicable for this employee.
            </Text>
            <View className="flex-row gap-3">
              <Controller
                control={control}
                name="regime"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-1 flex-row gap-3">
                    <Button
                      onPress={() => onChange('NEW')}
                      className="flex-1"
                      variant={value === 'NEW' ? 'primary' : 'outline'}>
                      New Regime
                    </Button>
                    <Button
                      onPress={() => onChange('OLD')}
                      className="flex-1"
                      variant={value === 'OLD' ? 'primary' : 'outline'}>
                      Old Regime
                    </Button>
                  </View>
                )}
              />
            </View>
            {errors.regime && (
              <Text className="mt-1 text-xs text-red-500">{errors.regime.message}</Text>
            )}
          </View>

          <View className="mb-6">
            <SectionHeader title="Deductions (Old Regime)" />
            <Text className="mb-4 text-xs text-gray-500">
              Enter the deduction amounts claimed by the employee.
            </Text>

            <Controller
              name="deductions80C"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    Section 80C
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Max Rs 1,50,000"
                    keyboardType="numeric"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="deductions80D"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    Section 80D (Health Insurance)
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Max Rs 1,00,000"
                    keyboardType="numeric"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="hraExemption"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    HRA Exemption
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="ltaExemption"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    LTA Exemption
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="homeLoanInterest"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    Home Loan Interest u/s 24(b)
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Max Rs 2,00,000"
                    keyboardType="numeric"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-xs text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="npsContribution"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="my-2 w-full">
                  <Text
                    className={cn(
                      'mb-2 ml-1',
                      error ? 'text-sm text-destructive' : 'text-sm font-medium text-foreground/70'
                    )}>
                    NPS u/s 80CCD(1B)
                  </Text>
                  <Input
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Max Rs 50,000"
                    keyboardType="numeric"
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
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || updateMutation.isPending}>
            {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Tax Details'}
          </Button>
        </ScrollView>
      </FormProvider>
    </Container>
  );
}
