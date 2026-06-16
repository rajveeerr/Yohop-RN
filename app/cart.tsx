import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CartScreen() {
  const router = useRouter();
  const [utensils, setUtensils] = useState(false);
  const [addNote, setAddNote] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Cart</Text>
          <TouchableOpacity>
            <Text style={styles.seeMenu}>see menu</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Your Order</Text>

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

        <TouchableOpacity style={styles.cardRow} activeOpacity={0.8}>
          <Ionicons name="gift-outline" size={18} color="#000" />
          <View style={styles.cardRowText}>
            <Text style={styles.cardRowTitle}>Make it a gift</Text>
            <Text style={styles.cardRowSub}>Add recipient info and a message</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#000" />
        </TouchableOpacity>

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
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.tabGroup}>
          <TouchableOpacity style={styles.tabBtn} activeOpacity={0.8}>
            <Text style={styles.tabText}>Tab</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/checkout?mode=delivery')}>
            <Text style={styles.tabText}>Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/checkout?mode=pickup')}>
            <Text style={styles.tabText}>Pickup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
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
  container: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
  },
  seeMenu: {
    fontSize: 12,
    color: '#444',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
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
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  orderTextCol: { flex: 1 },
  orderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  orderSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  priceNow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
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
  offerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  offerSub: {
    fontSize: 11,
    color: '#2BB673',
    marginTop: 2,
  },
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
  addItemsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  twoBoxRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
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
  smallBoxText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  tinyCheck: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyCheckOn: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
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
  cardRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  cardRowSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A1A',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2E2E2E',
  },
  tabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
