import { Container } from '@components/layout';
import { useAuthStore } from '@stores/auth.store';
import { PAGE_ROUTES } from '@utils/constants';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import {
  HomeActiveLeaveCard,
  HomeLeaveHistory,
  HomeNotificationCard,
  HomeQuickActions,
  HomeScreenSkeleton,
} from '../components';
import { getInitials } from '@utils/helpers';
import { useHomeOverview } from '../hooks';
import { truncateText } from '@utils/formatters';

export function HomeScreen() {
  const { user } = useAuthStore();
  const { isLoading, isFetching, refetch } = useHomeOverview();
  const nameString = `${user?.emp_fname} ${user?.emp_mname} ${user?.emp_lname}`;

  if (isLoading) return <HomeScreenSkeleton />;

  return (
    <Container>
      <ScrollView
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isFetching} />}
        showsVerticalScrollIndicator={false}
        className="flex-1">
        {/* Welcome */}

        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-1 items-start justify-center">
            <Text className="text-2xl font-bold">
              Welcome, {truncateText({ text: nameString, maxLength: 23 })}
            </Text>
            <Text className="mt-1 text-graphite">
              {truncateText({ text: user?.emp_dept || '', maxLength: 37 })} -{' '}
              {truncateText({ text: user?.emp_designation || '', maxLength: 20 })}
            </Text>
          </View>
          <View className="items-center justify-center rounded-md bg-primary p-3">
            <Text className="text-2xl font-black  uppercase text-white">
              {getInitials(user?.emp_fname, user?.emp_mname, user?.emp_lname)}
            </Text>
          </View>
        </View>

        {/* Notification banner */}
        <HomeNotificationCard />

        {/* Active Applications */}

        <Text className="mb-3 mt-8 text-lg font-semibold">Active Applications</Text>

        <HomeActiveLeaveCard />
        {/* Quick Actions */}

        <Text className="mb-3 mt-6 text-lg font-semibold">Quick Actions</Text>

        <HomeQuickActions />

        {/* History */}

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold">Recent History</Text>

          <Link href={PAGE_ROUTES.LEAVE.INDEX} asChild>
            <Text className="text-primary">View All</Text>
          </Link>
        </View>
        <HomeLeaveHistory />
      </ScrollView>
    </Container>
  );
}
