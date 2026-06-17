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
import { useMerchantStats } from '@/hooks/use-merchant-stats';
import { useMe } from '@/hooks/use-auth';
import { useMerchant } from '@/hooks/use-merchant';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';

export default function MerchantProfileScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const stored = useStoredMerchantProfile();
  const { data: me } = useMe();
  const { data: merchant } = useMerchant(me?.merchantId ?? undefined);
  const { data: stats } = useMerchantStats(me?.merchantId ?? undefined);

  const derivedStats = [
    {
      label: 'Revenue',
      value: stats ? `₹${Math.round(stats.totalRevenue).toLocaleString()}` : '—',
    },
    {
      label: 'Check-ins',
      value: stats ? String(stats.totalCheckIns) : '—',
    },
    {
      label: 'Avg Group',
      value: stats ? String(stats.avgGroupSize) : '—',
    },
    {
      label: 'Conv. Rate',
      value: stats ? `${(stats.conversionRate * 100).toFixed(1)}%` : '—',
    },
  ];

  const bizName = stored?.businessName || merchant?.businessName || 'Your business';
  const slugSource = stored?.businessName || merchant?.businessName;
  const handle = slugSource
    ? slugSource.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
    : 'business';
  const city = merchant?.city ?? null;
  const bio = stored?.businessBio || merchant?.description || 'No description added yet.';
  const address = stored?.address || merchant?.address || 'No address added yet.';
  const website = stored?.websiteUrl || merchant?.website || null;
  const remoteLogo = merchant?.logo || merchant?.logoUrl || null;
  const coverUri = stored?.photos?.[0] || merchant?.coverImage || merchant?.gallery?.[0] || null;
  const galleryImages = stored?.photos?.length ? stored.photos : merchant?.gallery ?? [];
  const amenities = stored?.amenities?.length ? stored.amenities : merchant?.amenities ?? [];
  const vibeTags = stored?.vibeTags?.length ? stored.vibeTags : merchant?.vibeTags ?? [];

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
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.2)" />
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.logoWrap}>
            {stored?.logoUri || remoteLogo ? (
              <Image
                source={{ uri: (stored?.logoUri || remoteLogo) as string }}
                style={styles.logoImg}
              />
            ) : (
              <View style={[styles.logo, { backgroundColor: '#C4F27F' }]}>
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
              @{handle}{city ? ` · ${city}` : ''}
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
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/merchant-menu')}>
            <Ionicons name="restaurant-outline" size={14} color="#fff" />
            <Text style={styles.secondaryBtnText}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={14} color="#fff" />
            <Text style={styles.secondaryBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {derivedStats.map((s) => (
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
          {website ? (
            <View style={styles.aboutMetaRow}>
              <Ionicons name="globe-outline" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.aboutMeta}>{website}</Text>
            </View>
          ) : null}
        </View>

        <SectionHeader label="Amenities" />
        {amenities.length > 0 ? (
          <View style={styles.tagsRow}>
            {amenities.map((t) => (
              <View key={t} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{t}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMeta}>No amenities listed yet.</Text>
        )}

        <SectionHeader label="Vibe" />
        {vibeTags.length > 0 ? (
          <View style={styles.tagsRow}>
            {vibeTags.map((t) => (
              <View key={t} style={[styles.tagPill, styles.tagPillAccent]}>
                <Text style={[styles.tagPillText, styles.tagPillTextAccent]}>{t}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMeta}>No vibe tags listed yet.</Text>
        )}

        <SectionHeader label="Gallery" />
        {galleryImages.length > 0 ? (
          <View style={styles.gallery}>
            {galleryImages.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.galleryItem} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMeta}>No gallery photos yet.</Text>
        )}
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
  emptyMeta: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontStyle: 'italic',
    paddingHorizontal: 18,
    paddingBottom: 12,
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
