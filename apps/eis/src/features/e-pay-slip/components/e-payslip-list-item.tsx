import { Text, TouchableOpacity, View } from 'react-native';
import { EPayslipListItem as EPaySlipI } from '../types';
import { formatDate } from '@utils/formatters';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';

export const EPayslipListItemCard = ({ item }: { item: EPaySlipI }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(PAGE_ROUTES.E_PAY_SLIP.DETAIL(item.payslip_no))}
      className="mb-4 rounded-md border border-border bg-white p-4 active:scale-[0.98]">
      {/* Card Header */}
      <View className="w-full flex-row items-start justify-between">
        <View className="flex-col">
          <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
            {formatDate(item.sign_date)}
          </Text>
          <Text className="mt-0.5 text-lg font-medium text-[#1b1c1c]">{item.payslip_no}</Text>
        </View>

        {/* Download Icon Button */}
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-[#cbe2fe] active:bg-primary">
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#024ad8" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="my-3 h-[1px] w-full bg-border/50" />

      {/* Slip Details Grid */}
      <View className="flex-row flex-wrap">
        <View className="mb-3 w-1/2">
          <Text className="text-xs text-graphite">Sign Date</Text>
          <Text className="mt-0.5 text-sm font-medium text-[#1b1c1c]">
            {formatDate(item.sign_date)}
          </Text>
        </View>

        <View className="mb-3 w-1/2">
          <Text className="text-xs text-graphite">GE Number</Text>
          <Text className="mt-0.5 text-sm font-medium text-[#1b1c1c]">{item.ge_number}</Text>
        </View>

        <View className="w-full">
          <Text className="text-xs text-graphite">Employee</Text>
          <Text className="mt-0.5 text-sm font-medium text-[#1b1c1c]">{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
