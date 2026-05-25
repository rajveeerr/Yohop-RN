import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetMerchantDraft } from '@/stores/merchant-draft';

export default function MerchantSubmittedScreen() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: 'partner' | 'fan' }>();
  const isPartner = flow !== 'fan';

  useEffect(() => {
    resetMerchantDraft();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.checkRing}>
          <View style={styles.checkInner}>
            <Ionicons name="checkmark" size={40} color="#000" />
          </View>
        </View>

        <Text style={styles.title}>Application submitted</Text>
        <Text style={styles.sub}>
          {isPartner
            ? 'Thanks! Our team will review your venue setup and get back within 24–48 hours.'
            : 'Thanks for the tip! We’ll review and reach out to onboard this venue within 24–48 hours.'}
        </Text>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color="#C4F27F" />
            <Text style={styles.metaText}>
              Estimated review time: 24–48 hours
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={16} color="#C4F27F" />
            <Text style={styles.metaText}>
              We’ll email you when it’s approved
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {isPartner ? (
          <>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => router.replace('/(merchant)' as never)}>
              <Text style={styles.primaryText}>Go to Dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.secondaryText}>Back to App</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.primaryText}>Back to App</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(196,242,127,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  metaCard: {
    marginTop: 26,
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  metaDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
