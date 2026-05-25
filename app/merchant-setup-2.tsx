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
import { MerchantProgressBar } from '@/components/merchant-progress-bar';
import {
  PartnerFanToggle,
  type PartnerFanValue,
} from '@/components/partner-fan-toggle';
import { setMerchantDraft, useMerchantDraft } from '@/stores/merchant-draft';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MerchantSetup2Screen() {
  const router = useRouter();
  const draft = useMerchantDraft();
  const [role, setRole] = useState<PartnerFanValue>('partners');

  const updateRole = (v: PartnerFanValue) => {
    setRole(v);
    if (v === 'fans') router.replace('/merchant-add-business');
  };

  const setAddress = (s: string) => setMerchantDraft({ address: s });
  const setWebsite = (s: string) => setMerchantDraft({ websiteUrl: s });
  const setEmail = (s: string) => setMerchantDraft({ email: s });
  const setContact = (s: string) => setMerchantDraft({ contactNumber: s });
  const setServices = (s: string) => setMerchantDraft({ services: s });

  const canContinue =
    draft.address.trim().length > 0 &&
    EMAIL_RE.test(draft.email.trim()) &&
    draft.contactNumber.trim().length >= 7;

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
      <MerchantProgressBar percent={66} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <PartnerFanToggle value={role} onChange={updateRole} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={draft.address}
              onChangeText={setAddress}
              placeholder="Where can we find you"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Website URL</Text>
            <TextInput
              style={styles.input}
              value={draft.websiteUrl}
              onChangeText={setWebsite}
              placeholder="https://"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={draft.email}
              onChangeText={setEmail}
              placeholder="contact@yourvenue.com"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Contact Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={draft.contactNumber}
              onChangeText={setContact}
              placeholder="+91 99999 99999"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Services Provided</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={draft.services}
              onChangeText={setServices}
              placeholder="Add Services..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              numberOfLines={4}
            />
          </View>
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
            onPress={() => router.push('/merchant-setup-3')}>
            <Text style={styles.continueText}>Save &amp; Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    minHeight: 46,
    fontSize: 13,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputMultiline: {
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 90,
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
