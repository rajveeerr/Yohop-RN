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
import { MOCK_MENU_ITEMS } from '@/constants/merchant-mock';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Cocktails', 'Tasting'];

export default function MerchantMenuItemEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useMemo(
    () => (id ? MOCK_MENU_ITEMS.find((m) => m.id === id) : undefined),
    [id],
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [category, setCategory] = useState(existing?.category ?? 'Mains');
  const [isAvailable, setIsAvailable] = useState(existing?.isAvailable ?? true);
  const [isHappyHour, setIsHappyHour] = useState(existing?.isHappyHour ?? false);
  const [isSurprise, setIsSurprise] = useState(existing?.isSurprise ?? false);

  const canSave = name.trim().length > 0 && Number(price) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {existing ? 'Edit Item' : 'New Menu Item'}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.imageCard} activeOpacity={0.85}>
            {existing?.image ? (
              <Image
                source={{ uri: existing.image }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={26} color="#fff" />
                <Text style={styles.imagePlaceholderText}>
                  Add an item photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionHeader label="Details" />
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Truffle Pasta"
            required
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="One-line description"
            multiline
          />
          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Field
                label="Price (₹)"
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                keyboardType="numeric"
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.catPill,
                        category === c && styles.catPillActive,
                      ]}
                      onPress={() => setCategory(c)}
                      activeOpacity={0.85}>
                      <Text
                        style={[
                          styles.catPillText,
                          category === c && styles.catPillTextActive,
                        ]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <SectionHeader label="Options" />
          <ToggleRow
            label="Available"
            sub="Show on customer menu"
            value={isAvailable}
            onChange={setIsAvailable}
          />
          <ToggleRow
            label="Happy Hour item"
            sub="Discounted during HH"
            value={isHappyHour}
            onChange={setIsHappyHour}
          />
          <ToggleRow
            label="Surprise pick"
            sub="Mystery — shown without details"
            value={isSurprise}
            onChange={setIsSurprise}
          />
        </ScrollView>

        <View style={styles.footer}>
          {existing && (
            <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.85}>
              <Ionicons name="trash-outline" size={16} color="#E53935" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            disabled={!canSave}
            onPress={() => router.back()}>
            <Text style={styles.saveText}>
              {existing ? 'Save changes' : 'Add to menu'}
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
      />
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
        thumbColor="#fff"
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
  scroll: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24 },
  imageCard: {
    width: '100%',
    height: 140,
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
  imagePlaceholderText: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
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
  rowGroup: { flexDirection: 'row', gap: 10 },
  catRow: { backgroundColor: 'transparent' },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catPillActive: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: '#C4F27F',
  },
  catPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  catPillTextActive: { color: '#C4F27F', fontWeight: '700' },
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
  toggleLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
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
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#000', fontSize: 14, fontWeight: '700' },
});
