import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Offer = { id: string; title: string; sub: string };
const OFFERS: Offer[] = [
  { id: '1', title: 'Cantina Crispy Chicken', sub: 'Buy 1, get 1 free (add 2 to basket)' },
  { id: '2', title: 'Spicy Cheesy Double', sub: 'Buy 1, get 1 free (add 2 to basket)' },
  { id: '3', title: 'Mango Freeze', sub: 'Buy 1, get 1 free (add 2 to basket)' },
];

type TimeOpt = 'priority' | 'standard' | 'schedule';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isPickup = params.mode === 'pickup';

  const [timeOpt, setTimeOpt] = useState<TimeOpt>('standard');
  const [utensils, setUtensils] = useState(false);
  const [addNote, setAddNote] = useState(false);

  const title = isPickup ? 'Pickup Details' : 'Delivery Details';
  const timeLabel = isPickup ? 'Pickup Time' : 'Delivery time';
  const toggleLabel = isPickup ? 'Delivery' : 'Pickup';
  const toggleMode = isPickup ? 'delivery' : 'pickup';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modePill}
          activeOpacity={0.8}
          onPress={() => router.replace(`/checkout?mode=${toggleMode}`)}>
          <Text style={styles.modePillText}>{toggleLabel}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity style={styles.locationCard} activeOpacity={0.8}>
          <View style={styles.locationIcon}>
            <Ionicons
              name={isPickup ? 'restaurant-outline' : 'location-outline'}
              size={16}
              color="#000"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>
              {isPickup ? 'Premium Omakase Experience' : 'San Francisco Bay Area'}
            </Text>
            <Text style={styles.locationSub}>
              {isPickup ? 'East Wing, Atlanta' : 'CA'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#000" />
        </TouchableOpacity>

        {!isPickup && (
          <TouchableOpacity style={styles.locationCard} activeOpacity={0.8}>
            <View style={styles.locationIcon}>
              <Ionicons name="person-outline" size={16} color="#000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>Meet at the door</Text>
              <Text style={styles.locationSub}>Add delivery note</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.timeHeader}>
          <Text style={styles.timeHeaderLabel}>{timeLabel}</Text>
          <Text style={styles.timeHeaderValue}>15-30 min(s)</Text>
        </View>

        <TouchableOpacity
          style={[styles.timeRow, timeOpt === 'priority' && styles.timeRowActive]}
          activeOpacity={0.8}
          onPress={() => setTimeOpt('priority')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeRowTitle}>Priority</Text>
            <Text style={styles.timeRowSub}>Delivered directly to you</Text>
          </View>
          <Text style={styles.timeRowRight}>+US$1.99</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeRow, timeOpt === 'standard' && styles.timeRowActive]}
          activeOpacity={0.8}
          onPress={() => setTimeOpt('standard')}>
          <Text style={styles.timeRowTitle}>Standard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeRow, timeOpt === 'schedule' && styles.timeRowActive]}
          activeOpacity={0.8}
          onPress={() => setTimeOpt('schedule')}>
          <Text style={styles.timeRowTitle}>Schedule</Text>
        </TouchableOpacity>

        <View style={styles.itemsHeader}>
          <Text style={styles.sectionLabel}>Your items</Text>
          <TouchableOpacity>
            <Text style={styles.seeMenu}>see menu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderItem}>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>1</Text>
          </View>
          <View style={styles.orderTextCol}>
            <Text style={styles.orderName}>Cantina Crispy Chicken</Text>
            <Text style={styles.orderSub}>
              6 Wings • Side of Celery • Ranch Dip
            </Text>
          </View>
          <View style={styles.priceCol}>
            <View style={styles.priceRow}>
              <Ionicons name="checkmark" size={12} color="#2BB673" />
              <Text style={styles.priceNow}>US$13.18</Text>
            </View>
            <Text style={styles.priceWas}>US$13.18</Text>
          </View>
        </View>

        {OFFERS.map((o) => (
          <View key={o.id} style={styles.offerItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{o.title}</Text>
              <Text style={styles.offerSub}>{o.sub}</Text>
            </View>
            <TouchableOpacity style={styles.plusBtn} activeOpacity={0.7}>
              <Ionicons name="add" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemsBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={16} color="#000" />
          <Text style={styles.addItemsText}>Add items</Text>
        </TouchableOpacity>

        <View style={styles.twoBoxRow}>
          <TouchableOpacity
            style={styles.smallBox}
            activeOpacity={0.8}
            onPress={() => setUtensils((v) => !v)}>
            <Text style={styles.smallBoxText}>Request utensils, etc.</Text>
            <View style={[styles.tinyCheck, utensils && styles.tinyCheckOn]}>
              {utensils && <Ionicons name="checkmark" size={10} color="#fff" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallBox}
            activeOpacity={0.8}
            onPress={() => setAddNote((v) => !v)}>
            <Text style={styles.smallBoxText}>Add note</Text>
            <View style={[styles.tinyCheck, addNote && styles.tinyCheckOn]}>
              {addNote && <Ionicons name="checkmark" size={10} color="#fff" />}
            </View>
          </TouchableOpacity>
        </View>

        {!isPickup && (
          <TouchableOpacity style={styles.cardRow} activeOpacity={0.8}>
            <Ionicons name="gift-outline" size={18} color="#000" />
            <View style={styles.cardRowText}>
              <Text style={styles.cardRowTitle}>Make it a gift</Text>
              <Text style={styles.cardRowSub}>
                Add recipient info and a message
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cardRow} activeOpacity={0.8}>
          <Ionicons name="pricetag-outline" size={18} color="#2BB673" />
          <View style={styles.cardRowText}>
            <Text style={[styles.cardRowTitle, { color: '#2BB673' }]}>
              Promotion applied
            </Text>
            <Text style={[styles.cardRowSub, { color: '#2BB673' }]}>
              You&apos;re saving US$25
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#000" />
        </TouchableOpacity>

        <View style={styles.priceBreak}>
          <PriceRow label="Subtotal" value="US$19.99" />
          <PriceRow label="Promotion" value="-US$19.99" valueColor="#2BB673" />
          {!isPickup && <PriceRow label="Delivery fee" value="US$0.49" hasInfo />}
          <PriceRow label="Taxes & Other fees" value="US$10.99" hasInfo />
          <PriceRow label="Total" value="US$10.71" bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.kbBtn} activeOpacity={0.7}>
          <Ionicons name="keypad-outline" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.9}
          onPress={() =>
            router.push({ pathname: '/payment', params: { amount: '20.04' } })
          }>
          <Text style={styles.nextBtnText}>Next</Text>
          <Text style={styles.nextBtnPrice}>US$10.71</Text>
        </TouchableOpacity>
      </View>
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
    <View style={styles.pRow}>
      <View style={styles.pLabelRow}>
        <Text style={[styles.pLabel, bold && styles.pBold]}>{label}</Text>
        {hasInfo && (
          <Ionicons name="information-circle-outline" size={12} color="#9B9B9B" />
        )}
      </View>
      <Text
        style={[
          styles.pValue,
          bold && styles.pBold,
          valueColor ? { color: valueColor } : null,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    marginTop: 4,
    marginBottom: 14,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  locationSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  timeHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  timeHeaderValue: {
    fontSize: 11,
    color: '#666',
  },
  timeRow: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeRowActive: {
    borderColor: '#000',
  },
  timeRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  timeRowSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  timeRowRight: {
    fontSize: 12,
    color: '#2BB673',
    fontWeight: '600',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  seeMenu: {
    fontSize: 12,
    color: '#444',
    textDecorationLine: 'underline',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  qtyBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 12, fontWeight: '700', color: '#000' },
  orderTextCol: { flex: 1 },
  orderName: { fontSize: 13, fontWeight: '700', color: '#000' },
  orderSub: { fontSize: 11, color: '#666', marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  priceNow: { fontSize: 13, fontWeight: '700', color: '#000' },
  priceWas: {
    fontSize: 11,
    color: '#888',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  offerTitle: { fontSize: 13, fontWeight: '700', color: '#000' },
  offerSub: { fontSize: 11, color: '#2BB673', marginTop: 2 },
  plusBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 22,
    paddingVertical: 10,
    marginTop: 12,
  },
  addItemsText: { fontSize: 12, fontWeight: '600', color: '#000' },
  twoBoxRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  smallBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallBoxText: { fontSize: 12, color: '#333', flex: 1 },
  tinyCheck: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyCheckOn: { backgroundColor: '#000', borderColor: '#000' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 10,
  },
  cardRowText: { flex: 1 },
  cardRowTitle: { fontSize: 13, fontWeight: '700', color: '#000' },
  cardRowSub: { fontSize: 11, color: '#666', marginTop: 2 },
  priceBreak: {
    marginTop: 16,
    paddingTop: 4,
  },
  pRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  pLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pLabel: { fontSize: 13, color: '#333' },
  pValue: { fontSize: 13, color: '#333' },
  pBold: { fontWeight: '700', color: '#000' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  kbBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  nextBtnPrice: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
