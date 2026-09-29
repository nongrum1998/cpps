import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { LoanCard, LoanListSkeleton } from '../components';
import { useLoans } from '../hooks';
import { SectionHeader } from '@components/common';

/**
 * Loan list screen. Queries the signed-in employee's loans via `useLoans()`
 * and renders them as a pull-to-refresh `FlatList` of cards, styled with a
 * section header ("Recent Loans") and a color-coded status badge per loan.
 *
 * Loading shows `LoanListSkeleton`; an empty result shows `EmptyScreen` with a
 * refresh action. Each card navigates to the loan detail screen.
 */
export function LoansScreen() {
  const { data: loans, isLoading, refetch, isFetching } = useLoans();

  if (isLoading) return <LoanListSkeleton />;

  if (!loans || loans.length === 0) {
    return (
      <Container>
        <EmptyScreen
          refresh={refetch}
          title="No loans found"
          message="You don't have any loans yet. Loans assigned to you will appear here."
        />
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      <View className="flex-1">
        {/* Section Header */}
        <SectionHeader title="Recent Loans" />
        {/* Loan List */}
        <FlatList
          data={loans}
          keyExtractor={(item) => item.loan_id}
          refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
          renderItem={({ item }) => <LoanCard item={item} />}
          contentContainerClassName="gap-y-4 pb-20"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Container>
  );
}
