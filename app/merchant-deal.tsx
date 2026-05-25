import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionHeader } from '@/components/section-header';
import { MOCK_DEALS } from '@/constants/merchant-mock';

export default function MerchantDealEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existing = useMemo(
    () => (id ? MOCK_DEALS.find((d) => d.id === id) : undefined),
    [id],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [discountPct, setDiscountPct] = useState(
    existing?.discountPercentage != null
      ? String(existing.discountPercentage)
      : '',
  );
  const [maxRedemptions, setMaxRedemptions] = useState(
    existing?.maxRedemptions != null ? String(existing.maxRedemptions) : '',
  );
  const [validFrom, setValidFrom] = useState(
    existing?.startTime ? existing.startTime.slice(0, 10) : '',
  );
  const [validTo, setValidTo] = useState(
    existing?.endTime ? existing.endTime.slice(0, 10) : '',
  );
  const [isFlashSale, setIsFlashSale] = useState(existing?.isFlashSale ?? false);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  const canSave = title.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{existing ? 'Edit Deal' : 'New Deal'}</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.imageCard}
            activeOpacity={0.85}>
            {existing?.images?.[0] ? (
              <Image
                source={{ uri: existing.images[0] }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color="#fff" />
                <Text style={styles.imagePlaceholderText}>
                  Add a hero image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionHeader label="Details" />
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Happy Hour 30% Off"
            required
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What’s included? Any catches?"
            multiline
          />

          <SectionHeader label="Discount & limits" />
          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Field
                label="Discount %"
                value={discountPct}
                onChangeText={setDiscountPct}
                placeholder="e.g., 30"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Max redemptions"
                value={maxRedemptions}
                onChangeText={setMaxRedemptions}
                placeholder="Optional"
                keyboardType="numeric"
              />
            </View>
          </View>

          <SectionHeader label="Validity" />
          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Field
                label="Starts"
                value={validFrom}
                onChangeText={setValidFrom}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Ends"
                value={validTo}
                onChangeText={setValidTo}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <SectionHeader label="Options" />
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Flash sale</Text>
              <Text style={styles.toggleSub}>
                Show with a flash badge in feeds
              </Text>
            </View>
            <Switch
              value={isFlashSale}
              onValueChange={setIsFlashSale}
              trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Active</Text>
              <Text style={styles.toggleSub}>Visible to fans right now</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
              thumbColor="#fff"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {existing && (
            <TouchableOpacity
              style={styles.dangerBtn}
              activeOpacity={0.85}>
              <Ionicons name="trash-outline" size={16} color="#E53935" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            disabled={!canSave}
            onPress={() => router.back()}>
            <Text style={styles.saveText}>
              {existing ? 'Save changes' : 'Publish Deal'}
            </Text>
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
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
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
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginTop: 10 },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  imageCard: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
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
  dangerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(229,57,53,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
