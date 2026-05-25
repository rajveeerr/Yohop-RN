import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {
  setMerchantDraft,
  useMerchantDraft,
  type MerchantCategory,
} from '@/stores/merchant-draft';

const SAMPLE_LOGO =
  'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=200&q=80';
const SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80';

type CategoryOption = {
  key: MerchantCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CATEGORIES: CategoryOption[] = [
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' },
  { key: 'cafe', label: 'Cafe', icon: 'cafe-outline' },
  { key: 'retail', label: 'Retail', icon: 'bag-handle-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function MerchantSetup1Screen() {
  const router = useRouter();
  const draft = useMerchantDraft();
  const [role, setRole] = useState<PartnerFanValue>('partners');

  const updateRole = (v: PartnerFanValue) => {
    setRole(v);
    if (v === 'fans') router.replace('/merchant-add-business');
  };

  const setCategory = (c: MerchantCategory) =>
    setMerchantDraft({ category: c });
  const setName = (s: string) => setMerchantDraft({ businessName: s });
  const setBio = (s: string) => setMerchantDraft({ businessBio: s });

  const onAddLogo = () => setMerchantDraft({ logoUri: SAMPLE_LOGO });
  const onAddPhotos = () =>
    setMerchantDraft({
      photos: [...draft.photos, SAMPLE_PHOTO].slice(0, 6),
    });

  const canContinue =
    !!draft.category && draft.businessName.trim().length >= 2;

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
      <MerchantProgressBar percent={33} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <PartnerFanToggle value={role} onChange={updateRole} />

        <Text style={styles.title}>Create your space</Text>
        <Text style={styles.subtitle}>
          Step 1: Define your venue’s profile and visual identity to attract the
          right crowd.
        </Text>

        <SectionHeader label="Category" />
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => {
            const active = draft.category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.85}
                style={[styles.categoryCard, active && styles.categoryCardActive]}
                onPress={() => setCategory(c.key)}>
                <Ionicons
                  name={c.icon}
                  size={22}
                  color={active ? '#C4F27F' : 'rgba(255,255,255,0.7)'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Business name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={draft.businessName}
            onChangeText={setName}
            placeholder="Enter your venue name"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Business Bio</Text>
          <TextInput
            style={styles.input}
            value={draft.businessBio}
            onChangeText={setBio}
            placeholder="What makes your venue special"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
        </View>

        <SectionHeader label="Visual Identity" />

        <TouchableOpacity
          style={styles.uploadCard}
          activeOpacity={0.85}
          onPress={onAddLogo}>
          {draft.logoUri ? (
            <Image source={{ uri: draft.logoUri }} style={styles.uploadThumb} />
          ) : (
            <View style={styles.uploadIconWrap}>
              <Ionicons name="add" size={22} color="#fff" />
            </View>
          )}
          <View style={styles.uploadTextCol}>
            <Text style={styles.uploadTitle}>
              {draft.logoUri ? 'Logo added' : 'Add logo'}
            </Text>
            <Text style={styles.uploadSub}>
              Recommended size: 500×500px. PNG or SVG.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadCardTall}
          activeOpacity={0.85}
          onPress={onAddPhotos}>
          <View style={styles.uploadIconLarge}>
            <Ionicons name="image-outline" size={26} color="#fff" />
          </View>
          <Text style={styles.uploadTitleCenter}>
            {draft.photos.length > 0
              ? `${draft.photos.length} photo${draft.photos.length > 1 ? 's' : ''} added — tap to add more`
              : 'Add Photos'}
          </Text>
          <Text style={styles.uploadSubCenter}>
            Upload at least 3 featured photos of your space.
          </Text>
          {draft.photos.length > 0 && (
            <View style={styles.photoStrip}>
              {draft.photos.slice(0, 6).map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backFooterBtn}
          activeOpacity={0.85}
          onPress={() => router.back()}>
          <Text style={styles.backFooterText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          disabled={!canContinue}
          onPress={() => router.push('/merchant-setup-2')}>
          <Text style={styles.continueText}>Save &amp; Continue</Text>
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
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
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
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 8,
    minHeight: 90,
    justifyContent: 'center',
  },
  categoryCardActive: {
    borderColor: '#C4F27F',
    backgroundColor: 'rgba(196,242,127,0.07)',
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#C4F27F',
  },
  fieldGroup: {
    marginTop: 16,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#C4F27F',
  },
  input: {
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  uploadTextCol: { flex: 1 },
  uploadTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  uploadCardTall: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadIconLarge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitleCenter: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadSubCenter: {
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
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  backFooterBtn: {
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFooterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  continueBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
