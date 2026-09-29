import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkBadge01Icon,
  BadgeIcon,
  UserIcon,
  ContactBookIcon,
  Briefcase02Icon,
  Wallet02Icon,
  IdentityCardIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { useAuthStore } from '@stores/auth.store';
import { ProfileScreenSkeleton, ConfirmLogoutAlert } from '../components';
import { EmptyScreen } from '@components/screens';
import { formatDate } from '@utils/formatters';
import { Container } from '@components/layout';
import { getFullName, getInitials } from '@utils/helpers';

/**
 * Card wrapper with a blue left-border accent and an icon header.
 * Groups related profile details into visually distinct sections.
 */
type ProfileSectionCardProps = {
  title: string;
  icon: readonly (readonly [string, { readonly [key: string]: string | number }])[];
  children: React.ReactNode;
};

function ProfileSectionCard({ title, icon, children }: ProfileSectionCardProps) {
  return (
    <View className="rounded-md border border-l-2 border-border border-l-primary bg-white p-4">
      <View className="mb-4 flex-row items-center">
        <HugeiconsIcon icon={icon} size={20} className="text-primary" />
        <Text className="ml-2 text-base font-semibold">{title}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * A label-value pair rendered inside a {@link ProfileSectionCard}.
 *
 * Supports half-width (`w-[48%]`, default) or full-width (`w-full`) layout
 * for flexible grid arrangements within a section.
 */
type ProfileDetailItemProps = {
  label: string;
  value: string;
  width?: string;
};

function ProfileDetailItem({ label, value, width = 'w-[48%]' }: ProfileDetailItemProps) {
  return (
    <View className={`flex-col ${width}`}>
      <Text className="mb-1 text-xs">{label}</Text>
      <Text className="text-base font-medium leading-tight">{value || '-'}</Text>
    </View>
  );
}

/** Thin horizontal divider for separating logical groups inside a section. */
function ProfileSectionDivider() {
  return <View className="my-2 w-full border-t border-border" />;
}

/**
 * Profile screen that displays the logged-in employee's personal, employment,
 * bank, and identification details in a modern card-based layout.
 *
 * Handles three states:
 * - **Loading**: Renders a {@link ProfileScreenSkeleton} with shimmer
 *   placeholders while the profile query is fetching.
 * - **Empty / Error**: If the profile data is null after loading, shows
 *   an {@link EmptyScreen} with a refresh action.
 * - **Loaded**: Renders the full profile layout including:
 *   - Identity section with avatar (initials), full name, designation,
 *     department, employee code badge, and status badge
 *   - Section cards for Personal Details, Contact Details, Employment
 *     Details, Bank & PF Details, and Identification
 *   - Action buttons for theme toggle and logout
 *   - App footer with version attribution
 *
 * @example
 * ```tsx
 * <ProfileScreen />
 * ```
 */
export const ProfileScreen = () => {
  const { emp_cd, user: profile, refresh: refetch, isAuthLoading: isLoading } = useAuthStore();
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);

  if (isLoading) return <ProfileScreenSkeleton />;

  if (!profile)
    return (
      <EmptyScreen
        refresh={refetch}
        refreshLabel="Refresh"
        title="Profile not found"
        message="Please try again"
      />
    );

  const fullName = getFullName(profile.emp_fname, profile.emp_mname, profile.emp_lname);

  const initials = getInitials(profile.emp_fname, profile.emp_mname, profile.emp_lname);

  return (
    <Container>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        {/* ── Identity Section ── */}
        <View className="mb-8 flex-col items-center">
          {/* Avatar with initials */}
          <View className="relative mb-4 h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary/10 ">
            <Text className="text-3xl font-bold text-primary">{initials}</Text>
            {/* Online status indicator */}
            <View className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-white bg-green-600" />
          </View>

          {/* Name and designation */}
          <Text className="mb-1 text-2xl font-bold">{fullName}</Text>
          <Text className="mb-3 text-center text-base text-graphite">
            {profile.emp_designation} • {profile.emp_dept}
          </Text>

          {/* Badges */}
          <View className="flex-row flex-wrap justify-center gap-2">
            <View className="flex-row items-center rounded-md bg-graphite/10 px-3 py-1 ">
              <View className="mr-1.5">
                <HugeiconsIcon icon={BadgeIcon} size={16} className="text-graphite" />
              </View>
              <Text className="text-sm font-medium text-graphite">{emp_cd || '-'}</Text>
            </View>
            <View className="flex-row items-center rounded-md bg-green-100 px-3 py-1">
              <View className="mr-1.5">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} color="#16a34a" />
              </View>
              <Text className="text-sm font-bold text-green-700">
                {profile.emp_status || 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Details Sections ── */}
        <View className="gap-y-4">
          {/* Personal Details */}
          <ProfileSectionCard title="Personal Details" icon={UserIcon}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <ProfileDetailItem label="Full Name" value={fullName} width="w-full" />
              <ProfileDetailItem label="Date of Birth" value={formatDate(profile.emp_birth_dt)} />
              <ProfileDetailItem label="Gender" value={profile.emp_sex || '-'} />
              <ProfileDetailItem label="Blood Group" value="-" />
              <ProfileDetailItem label="Marital Status" value="-" />
              <ProfileDetailItem label="Status" value={profile.emp_status || '-'} />
            </View>
          </ProfileSectionCard>

          {/* Contact Details */}
          <ProfileSectionCard title="Contact Details" icon={ContactBookIcon}>
            <View className="flex-col gap-y-4">
              <View className="flex-row justify-between">
                <ProfileDetailItem label="Email" value={profile.emp_email || '-'} />
                <ProfileDetailItem label="Phone" value={profile.emp_phone || '-'} />
              </View>
              <ProfileDetailItem label="Address" value="-" width="w-full" />
            </View>
          </ProfileSectionCard>

          {/* Employment Details */}
          <ProfileSectionCard title="Employment Details" icon={Briefcase02Icon}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <ProfileDetailItem label="Designation" value={profile.emp_designation || '-'} />
              <ProfileDetailItem label="Department" value={profile.emp_dept || '-'} />
              <ProfileDetailItem label="Parent Department" value={profile.parent_dept || '-'} />
              <ProfileDetailItem label="State Service" value={profile.state_service || '-'} />
              <ProfileDetailItem label="Office" value={profile.office_name || '-'} />
              <ProfileDetailItem
                label="Joining Date"
                value={formatDate(profile.emp_date_of_joining)}
              />
              <ProfileDetailItem label="Increment Date" value={formatDate(profile.inc_dt)} />
              <ProfileDetailItem label="Superannuation" value={formatDate(profile.emp_supan_dt)} />
              <ProfileDetailItem label="City Class" value={profile.emp_city_class || '-'} />
              <ProfileDetailItem
                label="Gazetted"
                value={profile.emp_gazetted === 'N' ? 'No' : 'Yes'}
              />

              <ProfileDetailItem label="PPan" value={profile.ppan || '-'} />
              <ProfileDetailItem label="Employee Type" value={profile.emp_type || '-'} />

              <ProfileSectionDivider />

              <Text className="mb-1.5 w-full text-sm text-graphite">Pay Information</Text>
              <View className="mb-2 w-full flex-row flex-wrap gap-x-4 gap-y-2">
                <Text className="text-base font-medium">{profile.pay_comm || '-'}</Text>
                <Text className="text-base font-medium">{profile.pay_scale || '-'}</Text>
                <Text className="text-base font-medium">₹{profile.basic_pay || '-'}</Text>
              </View>

              <ProfileDetailItem label="W.E.F Date" value={formatDate(profile.wef_dt)} />

              <ProfileSectionDivider />

              <ProfileDetailItem
                label="DDO / Treasury"
                value={`${profile.ddo_code || '-'} / ${profile.trea_code || '-'}`}
                width="w-full"
              />
              <ProfileDetailItem label="DDO Name" value={profile.ddo_name || '-'} width="w-full" />
            </View>
          </ProfileSectionCard>

          {/* Bank & PF Details */}
          <ProfileSectionCard title="Bank Details" icon={Wallet02Icon}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <ProfileDetailItem label="Bank Name" value="-" width="w-full" />
              <ProfileDetailItem label="Account No." value={profile.emp_bank_account_no || '-'} />
              <ProfileDetailItem label="IFSC Code" value={profile.emp_bank_ifsc || '-'} />

              <ProfileSectionDivider />

              <Text className="mb-1.5 w-full text-sm text-graphite">PF Information</Text>
              <ProfileDetailItem label="PF Type" value={profile.pf_type || '-'} />
              <ProfileDetailItem label="PF Agency" value={profile.pf_agency || '-'} />
              <ProfileDetailItem label="PF Series" value={profile.pf_series || '-'} />
              {profile.emp_type === 'DB' ? (
                <ProfileDetailItem label="PF Account No." value={profile.pf_no || '-'} />
              ) : (
                <ProfileDetailItem label="PRAN Account No." value={profile.pf_pran_no || '-'} />
              )}

              <ProfileSectionDivider />

              <Text className="mb-1.5 w-full text-sm text-graphite">GIS Information</Text>
              <ProfileDetailItem label="GIS Applicable" value={profile.gis_applicable || '-'} />
              <ProfileDetailItem
                label="Current GIS Group"
                value={profile.current_gis_group || '-'}
              />
            </View>
          </ProfileSectionCard>

          {/* Identification */}
          <ProfileSectionCard title="Identification" icon={IdentityCardIcon}>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <ProfileDetailItem label="PAN" value={profile.emp_pan_number || '-'} />
              <ProfileDetailItem label="PRAN" value={profile.pf_pran_no || '-'} />
              <ProfileDetailItem label="UAN" value="-" />
              <ProfileDetailItem label="CGHS No." value="-" />
            </View>
          </ProfileSectionCard>
        </View>

        {/* ── Actions ── */}
        <View className="mb-4 mt-8">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowLogoutAlert(true)}
            className="h-12 w-full flex-row items-center justify-center rounded-md border border-destructive bg-destructive/5">
            <View className="mr-2">
              <HugeiconsIcon icon={Logout01Icon} size={20} className="text-destructive" />
            </View>
            <Text className="text-sm font-semibold uppercase tracking-wide text-destructive">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center pb-8 opacity-60">
          <Text className="text-xs text-graphite">
            NIC e-HRMS v2.0 {'\u2022'} Government of India
          </Text>
        </View>

        <ConfirmLogoutAlert open={showLogoutAlert} onValueChange={setShowLogoutAlert} />
      </ScrollView>
    </Container>
  );
};
