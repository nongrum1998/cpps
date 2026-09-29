import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Container, KeyboardSafeView } from '@components/layout';
import { Input } from '@components/ui';

import {
  LeaveTypeDropdown,
  LeaveReasonDropdown,
  CreateLeaveSkeleton,
  CreateLeaveSubmitButton,
} from '@features/leave/components';
import { useRouter } from 'expo-router';
import { useSnackbar } from '@hooks';
import {
  CreateLeaveInputs,
  CreateLeaveSchema,
  LeaveReasonCode,
  useCreateLeave,
  useLeaveReason,
} from '@features/leave';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { calculateDaysBetweenDatesWithoutWeekends, cn, formatDateInput } from '@utils/helpers';
import { PAGE_ROUTES } from '@utils/constants';
import { LeaveTypeCode } from '@sharedTypes/leave';
import { SectionHeader } from '@components/common';
import { env } from '@utils/env';

const isDev = env.NODE_ENV === 'development';

const defaultValues: CreateLeaveInputs = {
  leave_cd: 'SL',
  from_dt: isDev ? '2027-06-01' : '',
  to_dt: isDev ? '2028-07-30' : '',
  no_days: isDev ? '1' : '',
  order_no: isDev ? '10' : '',
  order_dt: isDev ? '2026-05-25' : '',
  reason_text: isDev ? 'Test' : '',
  reason_cd: isDev ? '10' : '',
  remarks: isDev ? 'test' : '',
};

export function CreateLeaveScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const methods = useForm<CreateLeaveInputs>({
    resolver: zodResolver(CreateLeaveSchema),
    defaultValues,
    shouldFocusError: true,
    shouldUnregister: true,
  });

  const { mutate, isPending } = useCreateLeave();
  const { data: LeaveReason } = useLeaveReason();

  // Auto-calculate number_of_days when from_date or to_date changes
  const fromDate = useWatch({ control: methods.control, name: 'from_dt' });
  const toDate = useWatch({ control: methods.control, name: 'to_dt' });
  const reasonCode = useWatch({ control: methods.control, name: 'reason_cd' });

  useEffect(() => {
    const days = calculateDaysBetweenDatesWithoutWeekends(fromDate, toDate);
    if (days) {
      methods.setValue('no_days', days, { shouldValidate: true });
    }
  }, [fromDate, toDate, methods]);

  useEffect(() => {
    const selectedReason = LeaveReason?.find((reason) => reason.code_value === reasonCode);
    if (selectedReason) {
      methods.setValue('reason_text', selectedReason.code_text, { shouldValidate: true });
    }
  }, [reasonCode, LeaveReason, methods]);

  const onSubmit = (data: CreateLeaveInputs) => {
    mutate(data, {
      onSuccess: (data) => {
        if (data.success) {
          const leave = data.data;
          showSnackbar(data.message);
          if (leave) {
            const { leave_cd, from_dt, order_dt } = leave;
            const pageUrl = PAGE_ROUTES.LEAVE.DETAILS({
              leave_cd,
              from_dt,
              order_dt,
            });
            router.push(pageUrl);
            return;
          }
          router.back();
          return data;
        }
        showSnackbar(data.message);
        return data;
      },
    });
  };

  if (isPending) {
    return <CreateLeaveSkeleton />;
  }

  return (
    <KeyboardSafeView className="flex-1">
      <Container>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <SectionHeader title="Apply for leave" />

          <View className="flex-col gap-y-5 space-y-5">
            {/* Leave Type (Mocked Dropdown) */}
            <View className="flex-col gap-y-1.5 space-y-1.5">
              <Controller
                control={methods.control}
                name="leave_cd"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <LeaveTypeDropdown
                    title="Type"
                    selectedType={value as LeaveTypeCode}
                    error={error?.message}
                    onSelect={(type) => {
                      onChange(type);
                    }}
                  />
                )}
              />
            </View>

            {/* Date Range */}
            <View className="flex-row gap-x-2">
              {/* From Date */}
              <Controller
                control={methods.control}
                name="from_dt"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View className="my-2 w-1/2">
                    <Text className={cn('mb-2 ml-1 font-medium', error && 'text-destructive')}>
                      From Date
                    </Text>
                    <Input
                      value={value}
                      keyboardType="number-pad"
                      onChangeText={(text) => onChange(formatDateInput(text))}
                      placeholder="yyyy-mm-dd"
                      error={!!error}
                      testID="FROM_DATE_INPUT"
                    />
                    {error && (
                      <Text className={cn('ml-1 mt-2 text-sm text-destructive')}>
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* To Date */}
              <View className="flex-1">
                <Controller
                  control={methods.control}
                  name="to_dt"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <View className="my-2">
                      <Text className={cn('mb-2 ml-1 font-medium', error && 'text-destructive')}>
                        To Date
                      </Text>
                      <Input
                        value={value}
                        onChangeText={(text) => onChange(formatDateInput(text))}
                        placeholder="yyyy-mm-dd"
                        keyboardType="number-pad"
                        error={!!error}
                        testID="TO_DATE_INPUT"
                      />
                      {error && (
                        <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            <Controller
              control={methods.control}
              name="no_days"
              render={({ field: { value }, fieldState: { error } }) => (
                <View className="my-2">
                  <Text className={cn('mb-2 ml-1 font-medium', error && 'text-destructive')}>
                    Number of Days
                  </Text>
                  <Input
                    keyboardType="number-pad"
                    placeholder="Auto-calculated"
                    value={value}
                    editable={false}
                    testID="NUMBER_OF_DAYS_INPUT"
                    error={!!error?.message}
                  />

                  {error && (
                    <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />

            <View className="flex-1 flex-row gap-x-2">
              <Controller
                control={methods.control}
                name="order_no"
                render={({ field: { value }, fieldState: { error } }) => (
                  <View className="my-2 w-1/2">
                    <Text className={cn('mb-2 ml-1 font-medium', error && 'text-destructive')}>
                      Order Number
                    </Text>
                    <Input
                      keyboardType="number-pad"
                      placeholder="Please enter order number"
                      value={value}
                      testID="ORDER_NUMBER_INPUT"
                      error={!!error?.message}
                    />

                    {error && (
                      <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <View className="flex-1">
                <Controller
                  control={methods.control}
                  name="order_dt"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <View className="my-2 w-full">
                      <Text className={cn('mb-2 ml-1 font-medium', error && 'text-destructive')}>
                        Order Date
                      </Text>
                      <Input
                        keyboardType="number-pad"
                        placeholder="yyyy-mm-dd"
                        value={value}
                        onChangeText={(text) => onChange(formatDateInput(text))}
                        testID="ORDER_DATE_INPUT"
                        error={!!error?.message}
                      />

                      {error && (
                        <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
            {/* Reason */}
            <Controller
              control={methods.control}
              name="reason_cd"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <LeaveReasonDropdown
                  selectedReason={value as LeaveReasonCode}
                  onSelect={(reason) => {
                    onChange(reason);
                  }}
                  error={error?.message}
                />
              )}
            />

            {/* Reason Details */}

            <Controller
              control={methods.control}
              name="reason_cd"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <View className="flex-col gap-y-1.5 space-y-1.5">
                  <Text className={cn('text-sm font-semibold', error && 'text-destructive')}>
                    Reason for Leave
                  </Text>
                  <Input
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onChangeText={(reason) => onChange(reason)}
                    value={value}
                    placeholderTextColor="#9ca3af"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Address During Leave */}
            <Controller
              control={methods.control}
              name="remarks"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <View className="flex-col gap-y-1.5 space-y-1.5">
                  <Text className={cn('text-sm font-semibold', error && 'text-destructive')}>
                    Remarks
                  </Text>
                  <Input
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onChangeText={(reason) => onChange(reason)}
                    value={value || ''}
                    placeholderTextColor="#9ca3af"
                    error={!!error}
                  />
                  {error && (
                    <Text className="ml-1 mt-2 text-sm text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Submit Action */}

            <CreateLeaveSubmitButton
              label="Apply for Leave"
              onPress={methods.handleSubmit(onSubmit)}
              isDirty={methods.formState.isDirty}
            />
          </View>
        </ScrollView>
      </Container>
    </KeyboardSafeView>
  );
}
