import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const total = amount ?? '20.04';

  const onSelect = (id: 'cash' | 'paypal' | 'card') => {
    if (id === 'card') {
      router.push({ pathname: '/add-card', params: { amount: total } });
    } else {
      router.push({ pathname: '/placing-order', params: { amount: total } });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity
        hitSlop={10}
        style={styles.close}
        onPress={() => router.back()}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>
        Select your preferred{'\n'}payment method
      </Text>

      <View style={styles.list}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => onSelect('cash')}>
          <View style={styles.iconBox}>
            <Ionicons name="cash-outline" size={20} color="#2BB673" />
          </View>
          <Text style={styles.rowText}>Cash</Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => onSelect('paypal')}>
          <View style={styles.iconBox}>
            <FontAwesome name="paypal" size={20} color="#1565C0" />
          </View>
          <Text style={styles.rowText}>Paypal</Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => onSelect('card')}>
          <View style={styles.iconBox}>
            <Ionicons name="card-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.rowText}>Credit or Debit Card</Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 4,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 28,
  },
  list: { paddingHorizontal: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
});
