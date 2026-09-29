import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { GPFYearSelectSheet } from '@features/gpf-statements/components/gpf-years-select';
import { useGpfStatements } from '@features/gpf-statements/hooks';
import {
  GPFMonthlyTable,
  SummaryVerticalView,
  GpfStatementSkeleton,
} from '@features/gpf-statements/components';
import { GPFMonthlyData, GPFSummary } from '@features/gpf-statements/types';
import {
  BadgeCheckIcon,
  Calendar02Icon,
  IdentityCardIcon,
  LandmarkIcon,
  Refresh01Icon,
  TrendingUp,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { transformData } from '@utils/helpers';
import React from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { Card } from '@components/ui/card';
import { useAuthStore } from '@stores/auth.store';
import { useSnackbar } from '@hooks';
import { Button } from '@components/ui';
import { router } from 'expo-router';

export function GPFStatementScreen() {
  const [selectedYear, setSelectedYear] = React.useState<string>('');
  const { showSnackbar } = useSnackbar();
  const { user } = useAuthStore();
  const {
    data: gpfStatement,
    isLoading,
    refetch,
    isFetching,
  } = useGpfStatements({ financialYear: selectedYear });

  if (isLoading || isFetching) {
    return (
      <Container>
        <GpfStatementSkeleton />
      </Container>
    );
  }

  if (!selectedYear) {
    return (
      <Container>
        <View className="flex-row items-end gap-2 py-2">
          <View className="flex-1">
            <GPFYearSelectSheet
              onSelect={(value) => setSelectedYear(value)}
              selectedyear={selectedYear}
            />
          </View>

          <View className="py-3">
            <Button disabled={!selectedYear} onPress={refetch} size={'icon'} className="p-4">
              <HugeiconsIcon icon={Refresh01Icon} className="text-white" />
            </Button>
          </View>
        </View>
        <EmptyScreen
          title="Financial Years not selected"
          message={'Please select a financial year to continue'}
          refresh={() => router.back()}
          refreshLabel="Go Back"
        />
      </Container>
    );
  }

  if (!gpfStatement) {
    const onPressRefresh = () => {
      if (!selectedYear) {
        showSnackbar('Please select a finanical year');
        return;
      }
      refetch();
    };
    return (
      <Container>
        <View className="flex-row items-end gap-2 py-2">
          <View className="flex-1">
            <GPFYearSelectSheet
              onSelect={(value) => setSelectedYear(value)}
              selectedyear={selectedYear}
            />
          </View>

          <View className="py-3">
            <Button onPress={refetch} size={'icon'} className="p-4">
              <HugeiconsIcon icon={Refresh01Icon} className="text-white" />
            </Button>
          </View>
        </View>
        <EmptyScreen
          title="No GPF Statement"
          message={'No GPF Statement found, please select a year and try again'}
          refresh={onPressRefresh}
        />
      </Container>
    );
  }

  const { emp, summary, monthly_data } = gpfStatement;

  const monthlyData = transformData<GPFMonthlyData>(monthly_data) ?? [];
  const summaryData = transformData<GPFSummary>(summary) ?? [];

  return (
    <Container>
      {/* Main Content Area */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        {/* Title & Year Selector */}
        <View className="flex-row items-end gap-2 py-2">
          <View className="flex-1 items-center">
            <GPFYearSelectSheet
              onSelect={(value) => setSelectedYear(value)}
              selectedyear={selectedYear}
            />
          </View>

          <View className="py-3">
            <Button onPress={refetch} size={'icon'} className="p-4">
              <HugeiconsIcon icon={Refresh01Icon} className="text-white" />
            </Button>
          </View>
        </View>

        {/* Employee Information Card */}
        <Card variant="elevated" className="p-lg">
          <View className="flex-row flex-wrap gap-y-5">
            {/* Treasury - full width */}
            <View className="w-full flex-row items-start gap-sm">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={LandmarkIcon} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">Treasury</Text>
                <Text className="text-body-emphasis" numberOfLines={1}>
                  {emp?.treasury}
                </Text>
              </View>
            </View>

            {/* DDO - full width */}
            <View className="w-full flex-row items-start gap-sm">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={BadgeCheckIcon} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">DDO</Text>
                <Text className="text-body-emphasis" numberOfLines={1}>
                  {emp?.ddo}
                </Text>
              </View>
            </View>

            {/* GPF Number & Series - side by side */}
            <View className="w-1/2 flex-row items-start gap-sm pr-xs">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={IdentityCardIcon} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">GPF Number</Text>
                <Text className="text-body-emphasis" numberOfLines={1}>
                  {user?.pf_no}
                </Text>
              </View>
            </View>
            <View className="w-1/2 flex-row items-start gap-sm pl-xs">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={BadgeCheckIcon} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">GPF Series</Text>
                <Text className="text-body-emphasis" numberOfLines={1}>
                  {user?.pf_series}
                </Text>
              </View>
            </View>

            {/* Date of Birth & Interest Rate - side by side */}
            <View className="w-1/2 flex-row items-start gap-sm pr-xs">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={Calendar02Icon} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">Date of Birth</Text>
                <Text className="text-body-emphasis">{emp?.dob}</Text>
              </View>
            </View>
            <View className="w-1/2 flex-row items-start gap-sm pl-xs">
              <View className="bg-primary-fixed/30 mt-0.5 rounded-md p-2">
                <HugeiconsIcon icon={TrendingUp} size={20} color="#024ad8" />
              </View>
              <View className="flex-1 gap-y-1">
                <Text className="text-caption-md text-graphite">Interest Rate</Text>
                <Text className="text-body-emphasis">{emp?.interest_rate}%</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Monthly Statement Section */}
        <GPFMonthlyTable data={monthlyData} />

        {/* Statement Summary */}
        {summary && summary.length > 0 && <SummaryVerticalView data={summaryData} />}
      </ScrollView>
    </Container>
  );
}
