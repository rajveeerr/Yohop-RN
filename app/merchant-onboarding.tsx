import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PartnerFanToggle,
  type PartnerFanValue,
} from '@/components/partner-fan-toggle';

export default function MerchantOnboardingScreen() {
  const router = useRouter();
  const [role, setRole] = useState<PartnerFanValue>('partners');

  const onContinue = () => {
    if (role === 'partners') router.push('/merchant-setup-1');
    else router.push('/merchant-add-business');
  };

  const isPartner = role === 'partners';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Get Started</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <PartnerFanToggle value={role} onChange={setRole} />

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons
              name={isPartner ? 'storefront' : 'sparkles'}
              size={28}
              color="#C4F27F"
            />
          </View>
          <Text style={styles.heroTitle}>
            {isPartner ? 'List your business' : 'Help us grow'}
          </Text>
          <Text style={styles.heroSub}>
            {isPartner
              ? 'Reach thousands of nearby fans. Publish deals, host events, and manage bookings — all in one place.'
              : 'Know a great venue not on YOHOP yet? Submit it and we’ll reach out to onboard them.'}
          </Text>
        </View>

        <View style={styles.bulletList}>
          {(isPartner
            ? [
                { icon: 'pricetag-outline', label: 'Publish deals & flash offers' },
                { icon: 'calendar-outline', label: 'Host ticketed events' },
                { icon: 'book-outline', label: 'Accept table bookings' },
                { icon: 'bar-chart-outline', label: 'Live analytics & reviews' },
              ]
            : [
                { icon: 'add-circle-outline', label: 'Suggest a new venue' },
                { icon: 'flash-outline', label: '24–48 hour review' },
                { icon: 'gift-outline', label: 'Earn points when approved' },
              ]
          ).map((b) => (
            <View key={b.label} style={styles.bullet}>
              <Ionicons name={b.icon as any} size={16} color="#C4F27F" />
              <Text style={styles.bulletText}>{b.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={onContinue}>
          <Text style={styles.ctaText}>
            {isPartner ? 'Continue setup' : 'Add a business'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(196,242,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
    marginBottom: 18,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  bulletList: {
    marginTop: 20,
    gap: 10,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  cta: {
    backgroundColor: '#C4F27F',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
