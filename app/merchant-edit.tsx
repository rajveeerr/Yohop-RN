import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionHeader } from '@/components/section-header';
import { MERCHANT_BUSINESS } from '@/constants/merchant-mock';
import { merchantStorage } from '@/services/storage';
import {
  useStoredMerchantProfile,
  type MerchantCategory,
} from '@/stores/merchant-draft';

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

export default function MerchantEditScreen() {
  const router = useRouter();
  const stored = useStoredMerchantProfile();
  const [category, setCategory] = useState<MerchantCategory>(
    stored?.category ?? 'restaurant',
  );
  const [businessName, setBusinessName] = useState(
    stored?.businessName || MERCHANT_BUSINESS.name,
  );
  const [bio, setBio] = useState(
    stored?.businessBio ||
      'A late-night neon-soaked club in the heart of Delhi. Curated DJs and craft cocktails.',
  );
  const [address, setAddress] = useState(
    stored?.address || 'Hauz Khas Village, Delhi',
  );
  const [website, setWebsite] = useState(
    stored?.websiteUrl || 'https://neon-delhi.com',
  );
  const [email, setEmail] = useState(stored?.email || 'hello@neon-delhi.com');
  const [contact, setContact] = useState(
    stored?.contactNumber || '+91 98765 43210',
  );
  const [services, setServices] = useState(
    stored?.services || 'Live DJ, Private bookings, Bar service',
  );

  const onSave = async () => {
    await merchantStorage.save({
      category,
      businessName,
      businessBio: bio,
      logoUri: stored?.logoUri ?? null,
      photos: stored?.photos ?? [],
      address,
      websiteUrl: website,
      email,
      contactNumber: contact,
      services,
    });
    router.back();
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
        <Text style={styles.topTitle}>Edit Business</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SectionHeader label="Category" />
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
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

          <SectionHeader label="Profile" />
          <Field
            label="Business name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Your venue name"
            required
          />
          <Field
            label="Business Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="What makes your venue special"
            multiline
          />

          <SectionHeader label="Contact" />
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Where can we find you"
            required
          />
          <Field
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="hello@yourvenue.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <Field
            label="Contact Number"
            value={contact}
            onChangeText={setContact}
            placeholder="+91"
            keyboardType="phone-pad"
            required
          />

          <SectionHeader label="Services" />
          <Field
            label="Services Provided"
            value={services}
            onChangeText={setServices}
            placeholder="Add services..."
            multiline
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.85}
            onPress={onSave}>
            <Text style={styles.saveText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={{ color: '#C4F27F' }}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize}
      />
    </View>
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
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 24 },
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
    minHeight: 78,
    justifyContent: 'center',
  },
  categoryCardActive: {
    borderColor: '#C4F27F',
    backgroundColor: 'rgba(196,242,127,0.07)',
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: { color: '#C4F27F' },
  fieldGroup: { marginTop: 10 },
  fieldLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    fontSize: 13,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputMulti: {
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
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
  cancelBtn: {
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#000', fontSize: 14, fontWeight: '700' },
});
