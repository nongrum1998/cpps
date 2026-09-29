import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { LoanDetailSkeleton } from '../components';
import { useLoan } from '../hooks';
import { PAGE_ROUTES } from '@utils/constants';
import { formattedAmount } from '@utils/formatters';
import { cn, getStatusColor } from '@utils/helpers';

type LoanDetailSearchParamsT = {
  /** Unique identifier of the loan record (read from the `loanId` route segment). */
  loanId?: string;
};

/**
 * Loan detail screen. Resolves the loan by the `loanId` route segment via
 * `useLoan()` and renders every field of the record (description, loan number,
 * disbursed amount, recovery type/status, and interest balance/installment
 * data) inside a blue loan header card, a summary card, and an interest &
 * recovery card.
 *
 * Redirects to the list when `loanId` is missing, shows `LoanDetailSkeleton`
 * while loading, renders `EmptyScreen` when the record is missing,
 * and is otherwise the scrollable detail view with pull-to-refresh.
 */
export function LoanDetailScreen() {
  const { loanId } = useLocalSearchParams<LoanDetailSearchParamsT>();

  const { data, isLoading, isFetching, refetch } = useLoan({ loanId: loanId ?? '' });

  if (!loanId) return <Redirect href={PAGE_ROUTES.LOAN.LIST} />;

  if (isLoading && !data) return <LoanDetailSkeleton />;

  if (!data) {
    return (
      <EmptyScreen
        refresh={refetch}
        title="Loan Not Found"
        message="The loan you're looking for doesn't exist"
      />
    );
  }
  return (
    <Container className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
        showsVerticalScrollIndicator={false}>
        {/* Recovery Status Banner */}
        <View
          className={cn(
            'mb-6 w-full flex-row items-center justify-between rounded-md px-4 py-3',
            getStatusColor(data.recovery_status).bg,
            getStatusColor(data.recovery_status).border
          )}>
          <Text
            className={cn(
              'text-sm font-semibold uppercase',
              getStatusColor(data.recovery_status).text
            )}>
            Recovery Status
          </Text>
          <Text
            className={cn(
              'text-sm font-bold uppercase tracking-widest',
              getStatusColor(data.recovery_status).text
            )}>
            {data.recovery_status}
          </Text>
        </View>

        {/* Loan Group */}
        <View className="mb-6 flex-col rounded-md border border-graphite/20">
          {/* Loan Header Card */}
          <View className="flex-col rounded-t-md bg-primary p-4">
            <Text className="mb-1 text-sm text-blue-100 dark:text-blue-200">Loan Description</Text>
            <Text className="text-2xl font-bold text-white">{data.loan_desc}</Text>
            <Text className="mt-2 text-sm text-blue-100 dark:text-blue-200">Loan No. {loanId}</Text>
          </View>

          {/* Loan Summary Card */}
          <View className="flex-col rounded-b-md bg-white p-4 dark:bg-neutral-800">
            <DetailRow label="Amount Disbursed" value={formattedAmount(parseInt(data.amt_dis))} />
            <DetailRow label="Recovery Of" value={data.recovery_of} />
            <DetailRow label="Recovery Status" value={data.recovery_status} isLast />
          </View>
        </View>

        {/* Interest & Recovery Card */}
        <View className="mb-6 flex-col rounded-md border border-border bg-white p-4">
          <Text className="mb-1 border-b border-border pb-3 text-sm font-bold uppercase tracking-wide text-graphite">
            Interest &amp; Recovery
          </Text>

          <DetailRow label="Interest Balance" value={formattedAmount(parseInt(data.int_balance))} />
          <DetailRow
            label="Interest Installment Amount"
            value={formattedAmount(parseInt(data.int_inst_amt))}
          />
          <DetailRow
            label="Last Installment Recovered"
            value={formattedAmount(parseInt(data.int_lst_inst_rec))}
            isLast
          />
        </View>
      </ScrollView>
    </Container>
  );
}

/**
 * Renders a single label/value pair for the loan detail cards. A bottom border
 * separates rows unless the row is the last one in its card (`isLast`), and a
 * minimum height keeps the touch target comfortable.
 */
function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between ${
        !isLast ? 'mb-2 border-b border-border pb-2' : 'min-h-[44px]'
      }`}>
      <Text className="flex-1 pr-4 text-base text-graphite">{label}</Text>
      <Text className="text-right text-base font-medium text-graphite">{value}</Text>
    </View>
  );
}
