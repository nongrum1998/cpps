import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { LoanT } from '../types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Invoice01Icon } from '@hugeicons/core-free-icons';
import { formattedAmount } from '@utils/formatters';
import { cn, getStatusColor } from '@utils/helpers';

/**
 * Displays a single loan row in the loan list and navigates to the loan detail
 * screen when pressed. The pressed loan's `loan_id` is forwarded as the dynamic
 * `/loans/:loanId` route segment so the detail screen can resolve the full record.
 *
 * Shows the loan description, loan number, recovery status badge (color-coded
 * by open/close), disbursed amount, and the recovery type (Principal/Interest).
 */

export function LoanCard({ item }: { item: LoanT }) {
  const router = useRouter();

  const onPressLoan = () => {
    if (item.loan_id) {
      router.push(PAGE_ROUTES.LOAN.DETAILS(item.loan_id));
    }
  };

  return (
    <TouchableOpacity
      onPress={onPressLoan}
      activeOpacity={0.8}
      className="flex-col rounded-md border border-border bg-white p-4">
      {/* Top Row: Title, Loan No, and Badge */}
      <View className="flex-row items-start justify-between">
        <View className="flex-col gap-y-3">
          <Text className="mb-0.5 text-xl font-semibold">{item.loan_desc}</Text>
          <View className="flex-row items-center gap-x-2">
            <HugeiconsIcon icon={Invoice01Icon} size={14} className="mr-2 text-primary" />
            <Text className="text-sm font-medium text-primary">Loan No. {item.loan_id}</Text>
          </View>
        </View>

        <View className={cn(` rounded-md px-3 py-1`, getStatusColor(item.recovery_status).bg)}>
          <Text
            className={cn(
              'text-xs font-bold uppercase tracking-wider',
              getStatusColor(item.recovery_status).text
            )}>
            {item.recovery_status}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="my-3 h-[1px] w-full bg-graphite/20" />

      {/* Bottom Row: Amount and Type */}
      <View className="flex-row items-end justify-between">
        <View className="flex-col">
          <Text className="mb-0.5 text-sm text-graphite">Amount</Text>
          <Text className="text-base font-bold">{formattedAmount(item.amt_dis)}</Text>
        </View>
        <Text className="text-sm font-medium">Recovery of {item.recovery_of}</Text>
      </View>
    </TouchableOpacity>
  );
}
