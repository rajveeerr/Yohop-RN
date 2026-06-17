import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useReferrals } from '@/hooks/use-auth';

export default function ReferralScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data, isLoading, isRefetching, refetch } = useReferrals();

  const code = data?.referralCode ?? me?.referralCode ?? '';
  const count = data?.referralCount ?? 0;

  const onShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join me on YoHop! Use my referral code ${code} to get bonus points when you sign up. 🎉`,
        title: 'Join YoHop',
      });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message);
    }
  };

  const onCopy = () => {
    if (!code) return;
    // Expo Clipboard is an SDK package; use Share as fallback
    Alert.alert('Referral Code', `Your code is: ${code}\n\nShare it with friends to earn bonus points!`, [
      { text: 'Share', onPress: onShare },
      { text: 'OK' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Refer Friends</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#C4F27F" />}>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>Invite Friends,{'\n'}Earn Rewards</Text>
          <Text style={styles.heroSub}>
            Share your referral code and earn bonus points every time a friend joins YoHop.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{count}</Text>
            <Text style={styles.statLabel}>Friends Referred</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{count * 500}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Your Referral Code</Text>

        {isLoading ? (
          <ActivityIndicator color="#C4F27F" style={{ marginTop: 24 }} />
        ) : (
          <TouchableOpacity style={styles.codeCard} activeOpacity={0.8} onPress={onCopy}>
            <Text style={styles.codeText}>{code || '—'}</Text>
            <Ionicons name="copy-outline" size={18} color="#C4F27F" />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>How it works</Text>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepSub}>{s.sub}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85} onPress={onShare}>
          <Ionicons name="share-social" size={18} color="#000" />
          <Text style={styles.shareBtnText}>Share Referral Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const STEPS = [
  { title: 'Share your code', sub: 'Send your unique referral code to friends.' },
  { title: 'Friend signs up', sub: 'They enter your code during registration.' },
  { title: 'Both earn points', sub: 'You get 500 pts, they get a welcome bonus.' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.15)',
  },
  heroEmoji: { fontSize: 40, marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: { color: '#C4F27F', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  sectionLabel: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  codeCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.25)',
  },
  codeText: { color: '#C4F27F', fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#000', fontWeight: '800', fontSize: 13 },
  stepBody: { flex: 1 },
  stepTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  stepSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18 },
  shareBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C4F27F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
