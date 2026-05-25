import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MerchantDrawer } from '@/components/merchant-drawer';
import { MerchantTopBar } from '@/components/merchant-top-bar';
import { SectionHeader } from '@/components/section-header';
import {
  MERCHANT_BUSINESS,
  MERCHANT_STATS,
} from '@/constants/merchant-mock';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';

const COVER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80';

const GALLERY = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
  'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
];

const AMENITIES = ['Live DJ', 'Outdoor seating', 'Vegan options', 'Parking', 'Pet friendly'];
const VIBE = ['Lively', 'Late night', 'Group friendly', 'Music'];

export default function MerchantProfileScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const stored = useStoredMerchantProfile();

  const bizName = stored?.businessName || MERCHANT_BUSINESS.name;
  const handle = stored?.businessName
    ? stored.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
    : MERCHANT_BUSINESS.handle;
  const bio = stored?.businessBio ||
    'A late-night neon-soaked club in the heart of Delhi. Curated DJs, craft cocktails, and a no-phone-on-the-floor policy. Open Wed–Sun.';
  const address = stored?.address || 'Hauz Khas Village, Delhi';
  const website = stored?.websiteUrl || 'neon-delhi.com';
  const galleryImages = stored && stored.photos.length > 0 ? stored.photos : GALLERY;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MerchantTopBar title="Business" onMenu={() => setDrawerOpen(true)} />
      <MerchantDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: stored?.photos?.[0] ?? COVER }}
          style={styles.cover}
        />

        <View style={styles.header}>
          <View style={styles.logoWrap}>
            {stored?.logoUri ? (
              <Image
                source={{ uri: stored.logoUri }}
                style={styles.logoImg}
              />
            ) : (
              <View
                style={[
                  styles.logo,
                  { backgroundColor: MERCHANT_BUSINESS.logoColor },
                ]}>
                <Text style={styles.logoLetter}>
                  {bizName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerCol}>
            <View style={styles.headerTopRow}>
              <Text style={styles.bizName}>{bizName}</Text>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark" size={10} color="#000" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.bizHandle}>
              @{handle} · {MERCHANT_BUSINESS.city}
            </Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/merchant-edit')}>
            <Ionicons name="create-outline" size={14} color="#000" />
            <Text style={styles.primaryBtnText}>Edit Business</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={14} color="#fff" />
            <Text style={styles.secondaryBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {MERCHANT_STATS.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader label="About" />
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>{bio}</Text>
          <View style={styles.aboutMetaRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.aboutMeta}>{address}</Text>
          </View>
          <View style={styles.aboutMetaRow}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.aboutMeta}>Wed–Sun · 7:00 PM – 2:00 AM</Text>
          </View>
          {stored?.email ? (
            <View style={styles.aboutMetaRow}>
              <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.aboutMeta}>{stored.email}</Text>
            </View>
          ) : null}
          {stored?.contactNumber ? (
            <View style={styles.aboutMetaRow}>
              <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.aboutMeta}>{stored.contactNumber}</Text>
            </View>
          ) : null}
          <View style={styles.aboutMetaRow}>
            <Ionicons name="globe-outline" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.aboutMeta}>{website}</Text>
          </View>
        </View>

        <SectionHeader label="Amenities" />
        <View style={styles.tagsRow}>
          {AMENITIES.map((t) => (
            <View key={t} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{t}</Text>
            </View>
          ))}
        </View>

        <SectionHeader label="Vibe" />
        <View style={styles.tagsRow}>
          {VIBE.map((t) => (
            <View key={t} style={[styles.tagPill, styles.tagPillAccent]}>
              <Text style={[styles.tagPillText, styles.tagPillTextAccent]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        <SectionHeader label="Gallery" />
        <View style={styles.gallery}>
          {galleryImages.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.galleryItem} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  scroll: {
    paddingBottom: 140,
  },
  cover: {
    width: '100%',
    height: 150,
  },
  header: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: -28,
    marginBottom: 14,
  },
  logoWrap: {
    padding: 4,
    backgroundColor: '#000',
    borderRadius: 38,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  logoLetter: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
  },
  headerCol: {
    flex: 1,
    paddingBottom: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bizName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#C4F27F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
  },
  bizHandle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C4F27F',
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 14,
    marginHorizontal: 18,
    marginTop: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 2,
  },
  aboutCard: {
    marginHorizontal: 18,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  aboutText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  aboutMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 18,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagPillText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  tagPillAccent: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: 'rgba(196,242,127,0.35)',
  },
  tagPillTextAccent: {
    color: '#C4F27F',
    fontWeight: '700',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 0,
    marginTop: 4,
  },
  galleryItem: {
    width: '33.2%',
    aspectRatio: 1,
  },
});
