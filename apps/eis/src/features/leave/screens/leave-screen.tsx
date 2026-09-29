import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { LeaveCard, LeaveListSkeleton } from '@features/leave';
import { useLeaves } from '@hooks';
import { EmptyScreen } from '@components/screens';
import { router } from 'expo-router';
import { PAGE_ROUTES } from '@utils/constants';
import { FAB, SectionHeader } from '@components/common';

export function LeavesScreen() {
  const { data: leaves, isLoading, refetch, isFetching } = useLeaves();

  if (isLoading) return <LeaveListSkeleton />;

  if (leaves.length === 0) {
    const onPress = () => {
      if (leaves.length > 0) {
        refetch();
      }
      router.push(PAGE_ROUTES.LEAVE.CREATE);
    };

    return (
      <Container>
        <EmptyScreen
          refresh={onPress}
          title="No leave history"
          message="You haven't applied for any leave yet. When you do, they will appear here."
          refreshLabel={leaves.length > 0 ? 'Refresh' : 'Apply for leave'}
        />
      </Container>
    );
  }

  return (
    <Container className="flex-1">
      {/* Main Content */}

      <View className="flex-1 pb-20">
        <SectionHeader title="Recent Leave History" />
        <View className="flex-col gap-y-4 space-y-4">
          {/* Leave Card 1 */}
          <FlatList
            data={leaves}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
            renderItem={({ item }) => <LeaveCard item={item} />}
            contentContainerClassName="pb-20 gap-2"
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Floating Action Button */}
      <FAB onPress={() => router.push(PAGE_ROUTES.LEAVE.CREATE)} />
    </Container>
  );
}
