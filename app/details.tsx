import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookTable } from '@/hooks/use-table-booking';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    merchantId?: string;
    date?: string;
    time?: string;
    partySize?: string;
    title?: string;
    subtotal?: string;
  }>();

  const [name, setName] = useState('');
  const [guests, setGuests] = useState(params.partySize ?? '');
  const [time, setTime] = useState(params.time ?? '');
  const [occasion, setOccasion] = useState('');
  const [useLoyalty, setUseLoyalty] = useState(false);

  const bookTable = useBookTable();
  const busy = bookTable.isPending;

  const subtotal = params.subtotal ? parseFloat(params.subtotal) : 0;
  const charges = 0.49;
  const taxes = subtotal * 0.05;
  const total = subtotal + charges + taxes;

  const fmt = (n: number) => `US$${n.toFixed(2)}`;

  const onBook = async () => {
    if (!params.merchantId || !params.date) {
      router.push('/booked');
      return;
    }
    try {
      const result = await bookTable.mutateAsync({
        merchantId: params.merchantId,
        date: params.date,
        time: time || undefined,
        partySize: Number(guests) || 2,
        specialRequests: occasion || undefined,
      });
      router.replace({
        pathname: '/booked',
        params: {
          title: params.title ?? 'Booking',
          type: 'table',
          confirmationCode: result.confirmationCode,
        },
      });
    } catch (e: any) {
      Alert.alert('Booking failed', e?.message ?? 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.close}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Details</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#6E6E6E"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.rowTwo}>
          <View style={styles.half}>
            <Text style={styles.label}>Total Guests</Text>
            <TextInput
              style={styles.input}
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <Text style={styles.label}>Occasion</Text>
        <TextInput
          style={styles.input}
          placeholder="Birthday, anniversary…"
          placeholderTextColor="#6E6E6E"
          value={occasion}
          onChangeText={setOccasion}
        />

        <Text style={styles.label}>Choose your waiter</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.8}>
          <Text style={styles.dropdownText}>Any available</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {subtotal > 0 ? (
          <>
            <PriceRow label="Subtotal" value={fmt(subtotal)} />
            <PriceRow label="Booking Charges" value={fmt(charges)} />
            <PriceRow label="Taxes & Other fees" value={fmt(taxes)} hasInfo />
            <PriceRow label="Total" value={fmt(total)} bold />
          </>
        ) : (
          <>
            <PriceRow label="Booking Charges" value="US$0.49" />
            <PriceRow label="Taxes & Other fees" value="—" hasInfo />
            <PriceRow label="Total" value="—" bold />
          </>
        )}

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setUseLoyalty((v) => !v)}
          activeOpacity={0.8}>
          <View style={[styles.checkbox, useLoyalty && styles.checkboxChecked]}>
            {useLoyalty && <Ionicons name="checkmark" size={11} color="#000" />}
          </View>
          <Text style={styles.checkLabel}>Use Loyalty Points</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookBtn, busy && { opacity: 0.6 }]}
          activeOpacity={0.9}
          disabled={busy}
          onPress={onBook}>
          <Text style={styles.bookBtnText}>{busy ? 'Booking…' : 'Book'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function PriceRow({
  label,
  value,
  valueColor,
  hasInfo,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hasInfo?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <View style={styles.priceLabelRow}>
        <Text style={[styles.priceLabel, bold && styles.priceLabelBold]}>
          {label}
        </Text>
        {hasInfo && (
          <Ionicons name="information-circle-outline" size={12} color="#888" />
        )}
      </View>
      <Text
        style={[
          styles.priceValue,
          bold && styles.priceValueBold,
          valueColor ? { color: valueColor } : null,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1C1C1C',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 40,
    fontSize: 13,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1C',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 40,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  dropdownText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F1F',
    marginTop: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#BFBFBF',
  },
  priceLabelBold: {
    fontWeight: '700',
    color: '#fff',
  },
  priceValue: {
    fontSize: 13,
    color: '#BFBFBF',
  },
  priceValueBold: {
    fontWeight: '700',
    color: '#fff',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkLabel: {
    color: '#fff',
    fontSize: 13,
  },
  bookBtn: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  bookBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
