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
import {
  PartnerFanToggle,
  type PartnerFanValue,
} from '@/components/partner-fan-toggle';
import { SectionHeader } from '@/components/section-header';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MerchantAddBusinessScreen() {
  const router = useRouter();
  const [role, setRole] = useState<PartnerFanValue>('fans');
  const [orgName, setOrgName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [services, setServices] = useState('');

  const updateRole = (v: PartnerFanValue) => {
    setRole(v);
    if (v === 'partners') router.replace('/merchant-setup-1');
  };

  const canSubmit =
    orgName.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    contactNumber.trim().length >= 7;

  const onSubmit = () => {
    if (!canSubmit) return;
    router.replace({
      pathname: '/merchant-submitted',
      params: { flow: 'fan' },
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
        <Text style={styles.topTitle}>Add Business</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <PartnerFanToggle value={role} onChange={updateRole} />

          <SectionHeader label="Business Details" />
          <Field
            label="Organization Name"
            placeholder="e.g., Neon Nightclub"
            value={orgName}
            onChangeText={setOrgName}
            required
          />
          <Field
            label="Website URL"
            placeholder="Copy and paste this business's official website link..."
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            autoCapitalize="none"
            keyboardType="url"
            multiline
          />
          <Field
            label="Email"
            placeholder="Enter here"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />
          <Field
            label="Contact Number"
            placeholder=""
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            required
          />

          <SectionHeader label="Services & Categories" />
          <Field
            label="Services Provided"
            placeholder="Add services..."
            value={services}
            onChangeText={setServices}
            multiline
          />

          <SectionHeader label="Visual Identity" />
          <View style={styles.coverCard}>
            <View style={styles.coverIconWrap}>
              <Ionicons name="image-outline" size={26} color="#fff" />
            </View>
            <Text style={styles.coverTitle}>Business Cover Image</Text>
            <Text style={styles.coverSub}>
              High-quality imagery increases profile engagement by 60%
            </Text>
            <TouchableOpacity
              style={styles.coverBtn}
              activeOpacity={0.85}>
              <Text style={styles.coverBtnText}>Browse Gallery</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={onSubmit}
            disabled={!canSubmit}>
            <Text style={styles.submitText}>Submit for Review</Text>
            <Ionicons name="flash" size={16} color="#000" />
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Estimated review time: 24–48 hours
          </Text>
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
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>
        {label}
        {required ? <Text style={fieldStyles.req}> *</Text> : null}
      </Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginTop: 12 },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  req: { color: '#C4F27F' },
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
  coverCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  coverIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  coverSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  coverBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBtnText: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 6,
  },
  submitBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
