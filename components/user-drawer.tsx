import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useLogout, useMe } from '@/hooks/use-auth';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';
import { AppDrawer, type DrawerSection, type DrawerItem } from './app-drawer';

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K POINTS`;
  return `${n} POINTS`;
}

export function UserDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: me } = useMe();
  const logout = useLogout();
  const merchantProfile = useStoredMerchantProfile();
  const firstName = me?.name?.split(' ')[0] ?? 'You';
  const points = me?.points ?? 0;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const noop = () => {};

  const accountItems: DrawerItem[] = [
    {
      key: 'edit',
      label: 'Edit Account',
      icon: 'person-outline',
      onPress: () => router.push('/edit-profile'),
    },
  ];
  if (merchantProfile) {
    accountItems.push({
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      onPress: () => router.replace('/(merchant)' as never),
    });
  }
  accountItems.push(
    {
      key: 'activity',
      label: 'Activity',
      icon: 'pulse-outline',
      onPress: () => router.push('/activity'),
    },
    { key: 'checkins', label: 'Check-ins', icon: 'location-outline', onPress: noop },
    {
      key: 'favorites',
      label: 'Favorites',
      icon: 'heart-outline',
      onPress: () => router.push('/favorites'),
    },
  );

  const sections: DrawerSection[] = [
    { key: 'account', title: 'Account', items: accountItems },
    {
      key: 'social',
      title: 'Social',
      items: [
        { key: 'friends', label: 'Your Friends', icon: 'people-outline', onPress: noop },
        { key: 'contacts', label: 'Contacts', icon: 'call-outline', onPress: noop },
        {
          key: 'leaderboard',
          label: 'Leaderboard',
          icon: 'trophy-outline',
          onPress: () => router.push('/leaderboard'),
        },
      ],
    },
    {
      key: 'perks',
      title: 'Perks',
      items: [
        { key: 'rewards', label: 'Your Rewards', icon: 'gift-outline', onPress: noop },
        { key: 'redeemed', label: 'Redeemed', icon: 'checkmark-done-outline', onPress: noop },
        ...(merchantProfile
          ? []
          : [
              {
                key: 'merchant',
                label: 'Become a Merchant',
                icon: 'storefront-outline' as const,
                onPress: () => router.push('/merchant-onboarding'),
              },
            ]),
      ],
    },
  ];

  const bottomItems: DrawerItem[] = [
    { key: 'settings', label: 'Settings', icon: 'settings-outline', onPress: noop },
    {
      key: 'logout',
      label: 'Logout',
      icon: 'log-out-outline',
      onPress: handleLogout,
      destructive: true,
    },
  ];

  return (
    <AppDrawer
      visible={visible}
      onClose={onClose}
      header={{
        name: firstName,
        tag: 'Pro Member',
        meta: formatPoints(points),
      }}
      sections={sections}
      bottomItems={bottomItems}
    />
  );
}
