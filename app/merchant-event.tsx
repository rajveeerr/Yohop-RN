import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
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
import { MOCK_EVENTS } from '@/constants/merchant-mock';
import type { EventType } from '@/services/types';

const EVENT_TYPES: { key: EventType; label: string }[] = [
  { key: 'PARTY', label: 'Party' },
  { key: 'BAR_CRAWL', label: 'Bar Crawl' },
  { key: 'SPORTS', label: 'Sports' },
  { key: 'FESTIVAL', label: 'Festival' },
  { key: 'RSVP', label: 'RSVP' },
  { key: 'WAGBT', label: 'WAGBT' },
];

type TierDraft = { name: string; price: string; quantity: string };

export default function MerchantEventEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existing = useMemo(
    () => (id ? MOCK_EVENTS.find((e) => e.id === id) : undefined),
    [id],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [type, setType] = useState<EventType>(existing?.type ?? 'PARTY');
  const [venue, setVenue] = useState(existing?.venue ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [startDate, setStartDate] = useState(
    existing?.startDate ? existing.startDate.slice(0, 16).replace('T', ' ') : '',
  );
  const [endDate, setEndDate] = useState(
    existing?.endDate ? existing.endDate.slice(0, 16).replace('T', ' ') : '',
  );
  const [capacity, setCapacity] = useState(
    existing?.capacity != null ? String(existing.capacity) : '',
  );
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tiers, setTiers] = useState<TierDraft[]>([
    { name: 'General', price: '500', quantity: '100' },
  ]);

  const canSave = title.trim().length > 0 && venue.trim().length > 0;

  const updateTier = (i: number, patch: Partial<TierDraft>) => {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  };

  const addTier = () =>
    setTiers((prev) => [...prev, { name: '', price: '', quantity: '' }]);
  const removeTier = (i: number) =>
    setTiers((prev) => prev.filter((_, idx) => idx !== i));

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
          {existing ? 'Edit Event' : 'New Event'}
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
            {existing?.coverImage ? (
              <Image
                source={{ uri: existing.coverImage }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color="#fff" />
                <Text style={styles.imagePlaceholderText}>
                  Add a cover image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionHeader label="Basics" />
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Live Jazz Friday"
            required
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.typePill,
                    type === t.key && styles.typePillActive,
                  ]}
                  onPress={() => setType(t.key)}
                  activeOpacity={0.85}>
                  <Text
                    style={[
                      styles.typePillText,
                      type === t.key && styles.typePillTextActive,
                    ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell guests what to expect"
            multiline
          />

          <SectionHeader label="Location & time" />
          <Field
            label="Venue"
            value={venue}
            onChangeText={setVenue}
            placeholder="Your venue or external location"
            required
          />
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Full address"
          />
          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Field
                label="Starts"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD HH:MM"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Ends"
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD HH:MM"
              />
            </View>
          </View>
          <Field
            label="Capacity"
            value={capacity}
            onChangeText={setCapacity}
            placeholder="Total guests allowed"
            keyboardType="numeric"
          />

          <SectionHeader label="Ticket tiers" />
          {tiers.map((t, i) => (
            <View key={i} style={styles.tierCard}>
              <View style={styles.tierTopRow}>
                <Text style={styles.tierLabel}>Tier #{i + 1}</Text>
                {tiers.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeTier(i)}
                    hitSlop={10}>
                    <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.tierInput}
                value={t.name}
                onChangeText={(v) => updateTier(i, { name: v })}
                placeholder="Name (e.g., General, VIP)"
                placeholderTextColor="rgba(255,255,255,0.35)"
              />
              <View style={styles.rowGroup}>
                <TextInput
                  style={[styles.tierInput, { flex: 1 }]}
                  value={t.price}
                  onChangeText={(v) => updateTier(i, { price: v })}
                  placeholder="Price ₹"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.tierInput, { flex: 1 }]}
                  value={t.quantity}
                  onChangeText={(v) => updateTier(i, { quantity: v })}
                  placeholder="Qty"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addTierBtn}
            activeOpacity={0.85}
            onPress={addTier}>
            <Ionicons name="add" size={16} color="#C4F27F" />
            <Text style={styles.addTierText}>Add another tier</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.draftBtn}
            activeOpacity={0.85}
            onPress={() => router.back()}>
            <Text style={styles.draftText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            disabled={!canSave}
            onPress={() => router.back()}>
            <Text style={styles.saveText}>
              {existing ? 'Save changes' : 'Publish Event'}
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
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typePillActive: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: '#C4F27F',
  },
  typePillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  typePillTextActive: { color: '#C4F27F', fontWeight: '700' },
  tierCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    gap: 8,
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierLabel: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  tierInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  addTierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(196,242,127,0.4)',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addTierText: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
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
  draftBtn: {
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftText: { color: '#fff', fontSize: 13, fontWeight: '600' },
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
