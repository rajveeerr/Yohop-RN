import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout, useMe } from '@/hooks/use-auth';

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Row({ icon, iconColor, iconBg, label, sub, right, onPress }: RowProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg ?? '#1a1a1a' }]}>
        <Ionicons name={icon} size={16} color={iconColor ?? '#C4F27F'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right ?? (
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const logout = useLogout();

  const [pushNotif, setPushNotif] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState(true);
  const [friendActivity, setFriendActivity] = useState(false);
  const [leaderboardUpdates, setLeaderboardUpdates] = useState(true);
  const [shareCheckin, setShareCheckin] = useState(true);

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

  const firstName = me?.name?.split(' ')[0] ?? 'Guest';
  const email = me?.email ?? 'user@yohop.app';
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{firstName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.tierPill}>
              <Ionicons name="diamond" size={9} color="#C4F27F" />
              <Text style={styles.tierText}>PRO MEMBER</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editLink}>Edit ›</Text>
          </TouchableOpacity>
        </View>

        <SectionTitle title="Account" />
        <View style={styles.card}>
          <Row
            icon="person-outline"
            label="Edit profile"
            onPress={() => router.push('/edit-profile')}
          />
          <View style={styles.divider} />
          <Row icon="lock-closed-outline" label="Change password" />
          <View style={styles.divider} />
          <Row
            icon="call-outline"
            iconColor="#AE80FF"
            iconBg="rgba(174,128,255,0.18)"
            label="Phone number"
            sub="+91 98201 65042"
          />
          <View style={styles.divider} />
          <Row
            icon="ribbon-outline"
            iconColor="#FFB300"
            iconBg="rgba(255,179,0,0.18)"
            label="Membership"
            sub="Pro — renews Jun 2026"
          />
        </View>

        <SectionTitle title="Notifications" />
        <View style={styles.card}>
          <Row
            icon="notifications-outline"
            label="Push notifications"
            right={
              <Switch
                value={pushNotif}
                onValueChange={setPushNotif}
                trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <Row
            icon="location-outline"
            label="Nearby deal alerts"
            right={
              <Switch
                value={nearbyAlerts}
                onValueChange={setNearbyAlerts}
                trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <Row
            icon="people-outline"
            label="Friend activity"
            right={
              <Switch
                value={friendActivity}
                onValueChange={setFriendActivity}
                trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <Row
            icon="trophy-outline"
            label="Leaderboard updates"
            right={
              <Switch
                value={leaderboardUpdates}
                onValueChange={setLeaderboardUpdates}
                trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <SectionTitle title="Privacy & Location" />
        <View style={styles.card}>
          <Row
            icon="navigate-outline"
            iconColor="#AE80FF"
            iconBg="rgba(174,128,255,0.18)"
            label="Location access"
            sub="While using the app"
            right={
              <View style={styles.smallTag}>
                <Text style={styles.smallTagText}>On</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
              </View>
            }
          />
          <View style={styles.divider} />
          <Row
            icon="eye-outline"
            label="Profile visibility"
            sub="Friends only"
          />
          <View style={styles.divider} />
          <Row
            icon="stats-chart-outline"
            label="Share check-in data"
            right={
              <Switch
                value={shareCheckin}
                onValueChange={setShareCheckin}
                trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <SectionTitle title="Support" />
        <View style={styles.card}>
          <Row
            icon="help-circle-outline"
            iconColor="rgba(255,255,255,0.85)"
            iconBg="#1a1a1a"
            label="Help & FAQ"
          />
          <View style={styles.divider} />
          <Row
            icon="chatbubble-outline"
            iconColor="rgba(255,255,255,0.85)"
            iconBg="#1a1a1a"
            label="Contact support"
          />
          <View style={styles.divider} />
          <Row
            icon="document-text-outline"
            iconColor="rgba(255,255,255,0.85)"
            iconBg="#1a1a1a"
            label="Terms & privacy policy"
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#E53935" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  profileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
  },
  tierText: {
    color: '#C4F27F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  editLink: {
    color: '#C4F27F',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  rowSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 58,
  },
  smallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallTagText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 24,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '700',
  },
});
