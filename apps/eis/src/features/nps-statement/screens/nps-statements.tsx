import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
  NPSMemberInfoCard,
  NPSMonthlyTable,
  NPSSummaryCard,
  NpsStatementSkeleton,
} from '../components';
import { useNpsStatements } from '../hooks';
import { buildMonthlyRows, buildSummaryRows } from '../utils';
import { NpsFinYearSelectSheet } from '../components/nps-fin-years';
import { router } from 'expo-router';
import { useAuthStore } from '@stores/auth.store';
import { Button } from '@components/ui';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Refresh01Icon } from '@hugeicons/core-free-icons';

/**
 * NPS Statement (Annexure-5) screen.
 *
 * Fetches the current financial year's NPS statement via `get_annex5` RPC and
 * renders: member info card, monthly contribution table, and summary card.
 * Loading shows a skeleton; no data shows an empty state with a refresh action;
 * pull-to-refresh triggers a refetch.
 */
export const NpsStatementsScreen = () => {
  const [financialYear, setFinancialYear] = useState<string | null>('');
  const { user } = useAuthStore();
  const { data, isLoading, refetch, isFetching } = useNpsStatements({ finYear: financialYear });

  if (isLoading || isFetching) {
    return (
      <Container>
        <NpsStatementSkeleton />
      </Container>
    );
  }

  if (!user?.pf_pran_no) {
    return (
      <Container>
        <EmptyScreen
          title="PRAN No. is not updated"
          message={'Please update PRAN No. in treasury database'}
          refresh={() => router.back()}
          refreshLabel="Go Back"
        />
      </Container>
    );
  }

  if (!user?.ppan) {
    return (
      <Container>
        <EmptyScreen
          title="PPAN is not updated"
          message={'Please update PPAN in treasury database'}
          refresh={() => router.back()}
          refreshLabel="Go Back"
        />
      </Container>
    );
  }

  if (!financialYear) {
    return (
      <Container>
        <NpsFinYearSelectSheet
          selectedyear={financialYear || ''}
          onSelect={(value) => setFinancialYear(value)}
          disabled={isFetching}
        />
        <EmptyScreen
          title="No NPS Statement"
          message={'Please select a year to continue'}
          refresh={() => router.back()}
          refreshLabel="Go Back"
        />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <NpsFinYearSelectSheet
          selectedyear={financialYear || ''}
          onSelect={(value) => setFinancialYear(value)}
          disabled={isFetching}
        />
        <EmptyScreen
          title="No NPS Statement"
          message={`No NPS Statement found for financial year ${financialYear}.`}
          refresh={refetch}
        />
      </Container>
    );
  }

  const monthlyRows = buildMonthlyRows(data);
  const summaryRows = buildSummaryRows(data);

  return (
    <Container>
      <View className="flex-row items-end gap-2 py-2">
        <View className="flex-1">
          <NpsFinYearSelectSheet
            selectedyear={financialYear || ''}
            onSelect={(value) => setFinancialYear(value)}
            disabled={isFetching}
          />
        </View>

        <View className="py-3">
          <Button onPress={refetch} size={'icon'} className="p-4">
            <HugeiconsIcon icon={Refresh01Icon} className="text-white" />
          </Button>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        <NPSMemberInfoCard data={data} />
        {monthlyRows.length > 0 && <NPSMonthlyTable data={monthlyRows} />}
        {summaryRows.length > 0 && <NPSSummaryCard rows={summaryRows} />}
      </ScrollView>
    </Container>
  );
};
