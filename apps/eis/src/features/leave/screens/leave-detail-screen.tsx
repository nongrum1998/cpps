import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Wallet02Icon, CheckmarkBadge01Icon, Download01Icon } from '@hugeicons/core-free-icons';
import { Container } from '@components/layout';
import { Button } from '@components/ui';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useLeaveDetail } from '../hooks';
import { PAGE_ROUTES } from '@utils/constants';
import { LeaveDetailSkeleton } from '../components';
import { EmptyScreen } from '@components/screens';
import { LeaveTypeCode } from '@sharedTypes/leave';
import { Ternary } from '@components/common';
import { cn, getStatusColor } from '@utils/helpers';
import { getStatusIcon } from '@utils/helpers/get-icon';

type LeaveDetailSearchParamsT = {
  /** Leave type code (e.g. `SL` for Sick Leave). */
  leave_cd: LeaveTypeCode;
  /** Leave start date in `DD/MM/YYYY` display format. */
  from_dt: string;
  /** Order / approval date in `DD/MM/YYYY` display format. */
  order_dt: string;
};

export function LeaveDetailScreen() {
  const { leave_cd, from_dt, order_dt } = useLocalSearchParams<LeaveDetailSearchParamsT>();

  const isValidQueries = !!leave_cd && !!from_dt && !!order_dt;

  const { data, isLoading, isFetching, refetch } = useLeaveDetail({ from_dt, leave_cd, order_dt });

  const isLeaveVerified =
    data?.verify_flg_desc === 'Verified' || data?.verify_flg_desc === 'Rejected';

  if (!isValidQueries) return <Redirect href={PAGE_ROUTES.LEAVE.INDEX} />;

  if (isLoading || isFetching) return <LeaveDetailSkeleton />;

  if (!data) {
    return (
      <EmptyScreen
        refresh={refetch}
        title="Leave Not Found"
        message="The leave you're looking for doesn't exist"
      />
    );
  }

  return (
    <Container className="flex-1">
      {/* Scrollable Content Canvas */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Approval Banner */}
        <View
          className={cn(
            'mb-6 w-full flex-row items-center justify-center gap-2 rounded-md border p-4',
            getStatusColor(data.verify_flg_desc).bg,
            getStatusColor(data.verify_flg_desc).border
          )}>
          <HugeiconsIcon
            icon={getStatusIcon(data.verify_flg_desc)}
            size={20}
            className={cn(getStatusColor(data.verify_flg_desc).text)}
          />
          <Text
            className={cn(
              'text-sm font-bold uppercase tracking-widest',
              getStatusColor(data.verify_flg_desc).text
            )}>
            {data.verify_flg_desc}
          </Text>
        </View>

        <View className="flex-1 justify-between rounded-t-md bg-primary">
          <View className="flex-1 flex-row items-center justify-between p-3">
            <View>
              <Text className="text-base font-medium text-white">Leave Dates</Text>
              <Text className="mt-1 text-base font-semibold text-white">
                {data.from_dt} – {data.to_dt}
              </Text>
            </View>
            <View className="rounded-md bg-white px-3 py-1">
              <Text className="text-sm font-bold text-primary">
                {parseInt(data.no_days) > 1 ? `${data.no_days} Days` : `${data.no_days} Day`}
              </Text>
            </View>
          </View>
        </View>
        {/* Primary Details Card */}
        <View className="relative mb-6 flex-col overflow-hidden rounded-b-md border border-border bg-white p-4">
          {/* Order Info Grid */}
          <View className="z-10 flex-row justify-between pt-4">
            <View className="flex-1 flex-col pr-2">
              <Text className="mb-1 text-sm text-graphite">Order No.</Text>
              <Text className="text-base font-semibold">{data.order_no}</Text>
            </View>
            <View className="flex-1 flex-col">
              <Text className="mb-1 text-sm text-graphite">Order Date</Text>
              <Text className="text-base font-semibold">{data.order_dt1 ?? '-'}</Text>
            </View>
          </View>

          {/* Reason */}
          <View className="z-10 flex-col  pt-4">
            <Text className="mb-1.5 text-sm text-graphite">Type</Text>
            <View className="w-full self-start rounded-md border border-border bg-graphite/5 p-2.5">
              <Text className="text-base font-semibold">{data.leave_desc}</Text>
            </View>
          </View>

          {/* Address */}
          <View className="z-10 flex-col pt-4">
            <Text className="mb-1 text-sm text-graphite">Reason</Text>
            <View className="flex-row items-start gap-2 pt-1">
              <Text className="flex-1 text-base font-semibold">{data.reason_for_leave}</Text>
            </View>
          </View>
        </View>

        {/* Leave Balance Section */}
        <View className="mb-6 flex-col">
          <View className="mb-3 flex-row items-center gap-2">
            <HugeiconsIcon icon={Wallet02Icon} size={20} className="mr-2 text-primary" />
            <Text className="text-base font-semibold">Leave Balance</Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {/* Opening */}
            <View className="w-[48%] flex-col items-center rounded-md border border-border bg-graphite/5 p-3">
              <Text className="text-sm text-graphite">Opening</Text>
              <Text className="mt-0.5 text-xl font-bold">{data.opening_bal ?? 'N/A'}</Text>
            </View>

            {/* 

            <View className="w-[48%] flex-col items-center rounded-md border border-border bg-graphite/5 p-3">
              <Text className="text-sm text-graphite">Credited</Text>
              <Text className="mt-0.5 text-xl font-bold text-green-700 dark:text-green-400">
                +1
              </Text>
            </View>

            <View className="w-[48%] flex-col items-center rounded-md border border-destructive bg-destructive/5 p-3">
              <Text className="text-sm text-graphite">Debited</Text>
              <Text className="mt-0.5 text-xl font-bold text-destructive">-3</Text>
            </View>
            */}

            {/* Closing */}
            <View className="w-[48%] flex-col items-center rounded-md border border-primary bg-primary/10 p-3">
              <Text className="text-sm text-primary">Closing</Text>
              <Text className="mt-0.5 text-xl font-bold text-primary">
                {data.closing_bal ?? 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Section */}
        <View className="mb-8 flex-col">
          <View className="mb-3 flex-row items-center gap-2">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} color="#2563eb" className="mr-2" />
            <Text className="text-base font-semibold">Verification</Text>
          </View>

          <View className="flex-col rounded-md border border-border p-4 ">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base text-graphite">Status</Text>
              <View className="flex-row items-center gap-2">
                <HugeiconsIcon
                  icon={getStatusIcon(data.verify_flg_desc)}
                  size={18}
                  className={cn('mr-1.5', getStatusColor(data.verify_flg_desc).text)}
                />
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    getStatusColor(data.verify_flg_desc).text
                  )}>
                  {data.verify_flg_desc}
                </Text>
              </View>
            </View>

            <View className="mb-3 h-[1px] w-full bg-graphite/5" />

            <View className="flex-col">
              <Text className="mb-1 text-sm text-graphite">Remarks</Text>
              <Text className="text-base italic text-graphite">
                {data.remarks || data.reason_for_rejection || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Ternary
          condition={isLeaveVerified}
          ifTrue={
            <Button
              disabled={data.verify_flg_desc !== 'Verified'}
              onPress={() => {}}
              activeOpacity={0.8}
              size={'lg'}
              className="gap-2">
              <HugeiconsIcon icon={Download01Icon} size={20} className="mr-2 text-white" />
              <Text className="text-sm font-bold uppercase tracking-wide text-white">
                Download Order
              </Text>
            </Button>
          }
          ifFalse={
            <Button
              onPress={() => router.push(PAGE_ROUTES.LEAVE.UPDATE({ leave_cd, from_dt, order_dt }))}
              activeOpacity={0.8}
              size={'lg'}
              className="gap-2">
              <Text className="text-sm font-bold uppercase tracking-wide text-white">
                Update Leave
              </Text>
            </Button>
          }
        />
      </ScrollView>
    </Container>
  );
}
