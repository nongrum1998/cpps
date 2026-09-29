import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Container } from '@components/layout/container';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { cn } from '@utils/helpers/cn';
import { Button, Input, toast } from '@components/ui';
import { SectionHeader } from '@components/common/section-header';
import { useUpdateTaxDetail } from '@features/income-tax/hooks';
import { CreateTaxSkeleton } from '@features/income-tax/components/skeleton';
import { UpdateTaxSchema, UpdateTaxInput } from '@features/income-tax/validators/tax.validator';

export default function CreateTaxRecordScreen() {
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

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values: UpdateTaxInput) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Tax Record Created', {
        description: 'New tax record has been created.',
      });
      router.back();
    } catch (err: any) {
      toast.error('Creation Failed', {
        description: err?.message || 'Could not create tax record.',
      });
    }
  };

  if (isSubmitting || updateMutation.isPending) return <CreateTaxSkeleton />;

  return (
    <Container className="flex-1">
      <FormProvider {...methods}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <SectionHeader title="Tax Regime" />
            <View className="flex-row gap-3">
              <Controller
                control={control}
                name="regime"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Button
                      onPress={() => onChange('NEW')}
                      className={
                        'flex-1 p-4' +
                        (value === 'NEW'
                          ? 'bg-blue-600'
                          : 'border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800')
                      }>
                      <Text
                        className={
                          'text-center text-sm font-bold ' +
                          (value === 'NEW' ? 'text-white' : 'text-gray-700 dark:text-gray-300')
                        }>
                        New Regime
                      </Text>
                    </Button>
                    <Button
                      onPress={() => onChange('OLD')}
                      className={
                        'flex-1 p-4' +
                        (value === 'OLD'
                          ? 'bg-amber-600'
                          : 'border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800')
                      }>
                      <Text
                        className={
                          'text-center text-sm font-bold ' +
                          (value === 'OLD' ? 'text-white' : 'text-gray-700 dark:text-gray-300')
                        }>
                        Old Regime
                      </Text>
                    </Button>
                  </>
                )}
              />
            </View>
          </View>

          <View className="mb-6">
            <SectionHeader title="Deductions" />
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
                    Section 80D
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
            {isSubmitting || updateMutation.isPending ? 'Creating...' : 'Create Tax Record'}
          </Button>
        </ScrollView>
      </FormProvider>
    </Container>
  );
}
