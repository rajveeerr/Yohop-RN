import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useLogout } from '@/hooks/use-auth';
import { MERCHANT_BUSINESS } from '@/constants/merchant-mock';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';
import { AppDrawer, type DrawerSection, type DrawerItem } from './app-drawer';

export function MerchantDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const logout = useLogout();
  const profile = useStoredMerchantProfile();
  const displayName = profile?.businessName || MERCHANT_BUSINESS.name;
  const displayHandle =
    profile?.businessName
      ? `@${profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')}`
      : `@${MERCHANT_BUSINESS.handle}`;

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

  const sections: DrawerSection[] = [
    {
      key: 'business',
      title: 'Business',
      items: [
        {
          key: 'profile',
          label: 'Business Profile',
          icon: 'storefront-outline',
          onPress: () => router.push('/(merchant)/profile'),
        },
        {
          key: 'edit',
          label: 'Edit Business',
          icon: 'create-outline',
          onPress: () => router.push('/merchant-edit'),
        },
        {
          key: 'menu',
          label: 'Menu Items',
          icon: 'restaurant-outline',
          onPress: () => router.push('/merchant-menu'),
        },
      ],
    },
    {
      key: 'manage',
      title: 'Manage',
      items: [
        {
          key: 'deals',
          label: 'Deals',
          icon: 'pricetag-outline',
          onPress: () => router.push('/(merchant)/deals'),
        },
        {
          key: 'events',
          label: 'Events',
          icon: 'calendar-outline',
          onPress: () => router.push('/(merchant)/events'),
        },
        {
          key: 'bookings',
          label: 'Bookings',
          icon: 'book-outline',
          onPress: () => router.push('/(merchant)/bookings'),
        },
      ],
    },
    {
      key: 'insights',
      title: 'Insights',
      items: [
        {
          key: 'analytics',
          label: 'Analytics',
          icon: 'bar-chart-outline',
          onPress: () => router.push('/merchant-analytics'),
        },
        {
          key: 'activity',
          label: 'Activity',
          icon: 'pulse-outline',
          onPress: () => router.push('/activity'),
        },
        { key: 'reviews', label: 'Reviews', icon: 'star-outline', onPress: noop },
      ],
    },
  ];

  const bottomItems: DrawerItem[] = [
    { key: 'settings', label: 'Settings', icon: 'settings-outline', onPress: noop },
    {
      key: 'switch',
      label: 'Switch to User View',
      icon: 'swap-horizontal-outline',
      onPress: () => router.replace('/(tabs)'),
    },
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
        name: displayName,
        tag: MERCHANT_BUSINESS.tier,
        meta: displayHandle,
        avatarColor: MERCHANT_BUSINESS.logoColor,
      }}
      sections={sections}
      bottomItems={bottomItems}
    />
  );
}
