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
import { MerchantProgressBar } from '@/components/merchant-progress-bar';
import {
  PartnerFanToggle,
  type PartnerFanValue,
} from '@/components/partner-fan-toggle';
import { SectionHeader } from '@/components/section-header';
import { merchantStorage } from '@/services/storage';
import {
  useMerchantDraft,
  type MerchantCategory,
} from '@/stores/merchant-draft';

const CATEGORY_META: Record<
  MerchantCategory,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  restaurant: { label: 'Restaurant', icon: 'restaurant-outline' },
  cafe: { label: 'Cafe', icon: 'cafe-outline' },
  retail: { label: 'Retail', icon: 'bag-handle-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal' },
};

export default function MerchantSetup3Screen() {
  const router = useRouter();
  const draft = useMerchantDraft();
  const [role, setRole] = useState<PartnerFanValue>('partners');

  const updateRole = (v: PartnerFanValue) => {
    setRole(v);
    if (v === 'fans') router.replace('/merchant-add-business');
  };

  const onSubmit = async () => {
    await merchantStorage.save({
      category: draft.category,
      businessName: draft.businessName,
      businessBio: draft.businessBio,
      logoUri: draft.logoUri,
      photos: draft.photos,
      address: draft.address,
      websiteUrl: draft.websiteUrl,
      email: draft.email,
      contactNumber: draft.contactNumber,
      services: draft.services,
    });
    router.replace({
      pathname: '/merchant-submitted',
      params: { flow: 'partner' },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Venue Setup</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <MerchantProgressBar percent={100} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <PartnerFanToggle value={role} onChange={updateRole} />

        <Text style={styles.title}>Review your application</Text>

        <SectionHeader label="Category" />
        <View style={styles.categoryGrid}>
          {(Object.keys(CATEGORY_META) as MerchantCategory[]).map((k) => {
            const meta = CATEGORY_META[k];
            const active = draft.category === k;
            return (
              <View
                key={k}
                style={[styles.categoryCard, active && styles.categoryCardActive]}>
                <Ionicons
                  name={meta.icon}
                  size={20}
                  color={active ? '#C4F27F' : 'rgba(255,255,255,0.45)'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}>
                  {meta.label}
                </Text>
              </View>
            );
          })}
        </View>

        <ReadField label="Business name" value={draft.businessName} required />
        <ReadField label="Business Bio" value={draft.businessBio} />

        <SectionHeader label="Visual Identity" />
        <View style={styles.identityCard}>
          {draft.logoUri ? (
            <Image source={{ uri: draft.logoUri }} style={styles.identityThumb} />
          ) : (
            <View style={styles.identityPlaceholder}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.identityTextCol}>
            <Text style={styles.identityTitle}>
              {draft.logoUri ? 'Logo' : 'Add logo'}
            </Text>
            <Text style={styles.identitySub}>
              Recommended size: 500×500px. PNG or SVG.
            </Text>
          </View>
        </View>

        <View style={styles.photosCard}>
          <View style={styles.photoIconWrap}>
            <Ionicons name="image-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.photosTitle}>
            {draft.photos.length > 0
              ? `${draft.photos.length} photo${draft.photos.length > 1 ? 's' : ''} added`
              : 'Add photos'}
          </Text>
          <Text style={styles.photosSub}>
            Upload at least 3 featured photos of your space.
          </Text>
          {draft.photos.length > 0 && (
            <View style={styles.photoStrip}>
              {draft.photos.slice(0, 6).map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </View>
          )}
        </View>

        <ReadField label="Address" value={draft.address} required />
        <ReadField label="Website URL" value={draft.websiteUrl} />
        <ReadField label="Email" value={draft.email} required />
        <ReadField
          label="Contact Number"
          value={draft.contactNumber}
          required
        />
        <ReadField label="Services Provided" value={draft.services} multiline />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={onSubmit}>
          <Text style={styles.submitText}>Submit</Text>
          <Ionicons name="paper-plane-outline" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ReadField({
  label,
  value,
  required,
  multiline,
}: {
  label: string;
  value: string;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={readStyles.group}>
      <Text style={readStyles.label}>
        {label}
        {required ? <Text style={readStyles.req}> *</Text> : null}
      </Text>
      <View style={[readStyles.box, multiline && readStyles.boxMulti]}>
        <Text style={[readStyles.value, !value && readStyles.valueEmpty]}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

const readStyles = StyleSheet.create({
  group: { marginTop: 12 },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  req: { color: '#C4F27F' },
  box: {
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  boxMulti: { minHeight: 80 },
  value: { color: '#fff', fontSize: 13 },
  valueEmpty: { color: 'rgba(255,255,255,0.3)' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: {
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 6,
    minHeight: 80,
    justifyContent: 'center',
  },
  categoryCardActive: {
    borderColor: '#C4F27F',
    backgroundColor: 'rgba(196,242,127,0.07)',
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#C4F27F',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  identityThumb: { width: 44, height: 44, borderRadius: 10 },
  identityPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTextCol: { flex: 1 },
  identityTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  identitySub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  photosCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photosTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  photosSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  photoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    justifyContent: 'center',
  },
  photoThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
