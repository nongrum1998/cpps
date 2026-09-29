import { FilterCard } from '@components/common';
import { Container } from '@components/layout';
import { EmptyScreen } from '@components/screens';
import { SalaryStatementsListSkeleton, useSalaryStatements } from '@features/salary';
import { useSalaryYears } from '@hooks/use-salary-years';
import { Add01Icon, CrossIcon, FileDownloadIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { formatCurrency } from '@utils/formatters';
import { cn, getCurrentYear, getPreviousMonth } from '@utils/helpers';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { previewSalaryStatementPdf } from '../uitls/helpers/share-salary-statement-pdf';
import { useSnackbar } from '@hooks';
import { useAuthStore } from '@stores/auth.store';
import { logger } from '@utils/logger';

const currentMonth: string = getPreviousMonth();
const currentYear: string = getCurrentYear().toString();

export function SalaryStatement() {
  const { user, emp_cd } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toUpperCase());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  const {
    data: salaryYears,
    isFetching: isFetchingSalYear,
    isLoading: isLoadingSalYear,
  } = useSalaryYears();

  const {
    data: salary,
    isLoading,
    isFetching,
    refetch,
  } = useSalaryStatements({
    month: selectedMonth,
    year: parseInt(selectedYear),
  });

  // Split s_data into earnings and deductions based on amount value (positive vs negative)
  const earnings = salary?.s_data?.filter((item) => parseFloat(item.amount) > 0) || [];

  const deductions = salary?.s_data?.filter((item) => parseFloat(item.amount) < 0) || [];

  const noStatementMessage = `No salary statement is available for the selected month ${selectedMonth.toLowerCase()} ${selectedYear}.`;

  const handleOnPressPreview = () => {
    try {
      setIsDownloading(true);
      if (salary) {
        previewSalaryStatementPdf({
          ...salary,
          employeeName: `${user?.emp_fname} ${user?.emp_mname} ${user?.emp_lname}`,
          designation: user?.emp_designation,
          department: user?.emp_dept,
          employeeCode: emp_cd,
          panNumber: user?.emp_pan_number,
          payPeriod: salary.voucher_date,
        });
      }
    } catch (error: any) {
      showSnackbar(error.message);
      logger.error('Salary Statement Preview pdf', error);
    }
  };

  useEffect(() => {
    if (isDownloading) {
      setTimeout(() => setIsDownloading(false), 3000);
    }
  }, [isDownloading]);

  if (isLoading || isLoadingSalYear) {
    return <SalaryStatementsListSkeleton />;
  }

  if (!salary) {
    return (
      <Container className="flex-1">
        <FilterCard
          year={selectedYear}
          years={salaryYears?.map((year) => year.sal_year)}
          onYearChange={(value) => setSelectedYear(value)}
          month={selectedMonth}
          onMonthChange={(value) => setSelectedMonth(value)}
          isOpen={isFetchingSalYear || isLoadingSalYear ? false : true}
        />
        <EmptyScreen title="No Statement Found" message={noStatementMessage} refresh={refetch} />
      </Container>
    );
  }

  return (
    <>
      <FilterCard
        year={selectedYear}
        years={salaryYears?.map((year) => year.sal_year)}
        onYearChange={(value) => setSelectedYear(value)}
        month={selectedMonth}
        onMonthChange={(value) => setSelectedMonth(value)}
        isOpen={isFetchingSalYear || isLoadingSalYear ? false : undefined}
      />
      <Container className="flex-1">
        {/* Main Content Canvas */}
        <ScrollView
          className="flex-1 pt-2"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}>
          {/* Summary Card: Net Payable */}
          <View className="relative mb-6 flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-white p-6">
            <Text className="mb-2 text-xs font-medium uppercase tracking-widest text-graphite">
              Take Home / Net Payable
            </Text>
            <View className="mb-4 flex-col items-center justify-center gap-y-2">
              <Text className="text-center text-4xl font-extrabold tracking-tight text-black">
                {formatCurrency(salary?.net_pay)}
              </Text>
              <Text className="text-center text-xs tracking-widest text-graphite">
                {salary?.net_pay_in_word}
              </Text>
            </View>

            {/* Actions  
            <View className="flex-row gap-x-4 space-x-4">
              <TouchableOpacity
                disabled
                className="h-11 flex-row items-center space-x-2 rounded-md bg-primary/10 px-4 py-3 disabled:opacity-50">
                <HugeiconsIcon icon={FileDownloadIcon} size={20} color="#2563eb" className="mr-2" />
                <Text className="ml-1 text-sm font-semibold text-primary">PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => await shareSalaryStatementPdf(salary)}
                className="h-11 flex-row items-center space-x-2 rounded-md border border-border px-4 py-3 disabled:opacity-50">
                <HugeiconsIcon icon={ShareIcon} size={20} color="#6b7280" className="mr-2" />
                <Text className="ml-1 text-sm font-semibold text-graphite dark:text-gray-300">
                  Share
                </Text>
              </TouchableOpacity>
            </View>
              */}
          </View>
          {/* Details Grid (Stacked on Mobile) */}
          <View className="flex-col gap-y-6 space-y-6">
            {/* Earnings Section */}
            <View className="overflow-hidden rounded-md border border-border bg-white  dark:border-neutral-700 dark:bg-neutral-800">
              <View className="flex-row items-center border-b border-border bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-700/50">
                <HugeiconsIcon icon={Add01Icon} size={20} color="#10b981" className="mr-2" />
                <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
                  Earnings
                </Text>
              </View>

              <View className="flex-col">
                {earnings.length > 0 ? (
                  earnings.map((item, index) => (
                    <SalaryStatementItemRow
                      key={index}
                      label={item.pname.replace('_', ' ')}
                      amount={`${formatCurrency(item.amount)}`}
                      isLast={index === earnings.length - 1}
                    />
                  ))
                ) : (
                  <Text className="p-4 text-center text-graphite">No earnings data</Text>
                )}
              </View>

              <View className="flex-row items-center justify-between border-t border-emerald-100 bg-emerald-50 p-4">
                <Text className="text-base font-bold text-emerald-800">Total Earnings</Text>
                <Text className="text-xl font-bold text-emerald-800">
                  {formatCurrency(salary?.totalEmolument)}
                </Text>
              </View>
            </View>

            {/* Deductions Section */}
            <View className="overflow-hidden rounded-md border border-border bg-white  dark:border-neutral-700 dark:bg-neutral-800">
              <View className="flex-row items-center border-b border-border bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-700/50">
                <HugeiconsIcon icon={CrossIcon} size={20} color="#f43f5e" className="mr-2" />
                <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
                  Deductions
                </Text>
              </View>

              <View className="flex-col">
                {deductions.length > 0 ? (
                  deductions.map((item, index) => (
                    <SalaryStatementItemRow
                      key={index}
                      label={item.pname.replace('_', ' ')}
                      amount={`${formatCurrency(item.amount.replace('-', ''))}`}
                      isLast={index === deductions.length - 1}
                    />
                  ))
                ) : (
                  <Text className="p-4 text-center text-graphite">No deductions data</Text>
                )}
              </View>

              <View className="flex-row items-center justify-between border-t-[0.5px] border-destructive/10 bg-destructive/10 p-4">
                <Text className="text-base font-bold text-destructive">Total Deductions</Text>
                <Text className="text-xl font-bold text-destructive">
                  {formatCurrency(salary?.totalPayItem)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Strip */}
      </Container>
      <View
        className="absolute bottom-0 left-0 w-full flex-row items-center justify-between border-t border-border bg-white p-4"
        style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}>
        <View>
          <Text className="mb-0.5 text-xs text-graphite">Net Payable</Text>
          <Text className="text-xl font-bold text-emerald-600">
            {formatCurrency(salary?.net_pay)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOnPressPreview}
          disabled={isDownloading}
          className="h-12 flex-row items-center justify-center gap-x-2 rounded-md bg-primary px-6 disabled:bg-primary/50">
          <HugeiconsIcon icon={FileDownloadIcon} size={20} color="white" className="mr-2" />
          <Text className="text-sm font-semibold uppercase tracking-wide text-white">
            Download PDF
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// Reusable component for list rows
function SalaryStatementItemRow({
  label,
  amount,
  isLast = false,
}: {
  label: string;
  amount: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={cn(
        `min-h-[44px] flex-row items-center justify-between px-4 py-3 `,
        !isLast ? 'border-b border-border' : ''
      )}>
      <Text className="text-base text-graphite">{label}</Text>
      <Text className="text-base font-medium text-graphite">{amount}</Text>
    </View>
  );
}
