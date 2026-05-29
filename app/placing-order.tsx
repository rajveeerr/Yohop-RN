import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCapturePayment } from '@/hooks/use-payments';

const STEPS: { title: string; sub?: string }[] = [
  { title: 'Home', sub: 'door' },
  { title: 'Standard Delivery : 20-30 min(s)' },
  { title: 'Your Order' },
];

export default function PlacingOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
    orderId?: string;
    paymentId?: string;
  }>();
  const amount = params.amount;
  const [done, setDone] = useState(0);
  const capture = useCapturePayment();
  const captureFired = useRef(false);

  useEffect(() => {
    if (params.orderId && !captureFired.current) {
      captureFired.current = true;
      capture.mutate({
        orderId: params.orderId,
        paymentId: params.paymentId || undefined,
      });
    }
  }, [params.orderId, params.paymentId, capture]);

  useEffect(() => {
    if (done >= STEPS.length) {
      const t = setTimeout(() => {
        router.replace({
          pathname: '/paid',
          params: { amount: amount ?? '20.04' },
        });
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 900);
    return () => clearTimeout(t);
  }, [done, amount, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Placing order...</Text>

      <View style={styles.list}>
        {STEPS.map((s, i) => {
          const isDone = i < done;
          return (
            <View key={s.title} style={styles.item}>
              <View style={[styles.check, isDone && styles.checkOn]}>
                {isDone && <Ionicons name="checkmark" size={14} color="#000" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.itemTitle, isDone && styles.itemTitleDone]}>
                  {s.title}
                </Text>
                {s.sub ? <Text style={styles.itemSub}>{s.sub}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.undo}
          activeOpacity={0.85}
          onPress={() => router.back()}>
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 14,
    marginLeft: 22,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 22,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkOn: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemTitleDone: {
    color: '#9B9B9B',
    textDecorationLine: 'line-through',
  },
  itemSub: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  undo: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 13,
    paddingHorizontal: 60,
    minWidth: 200,
    alignItems: 'center',
  },
  undoText: { color: '#000', fontSize: 14, fontWeight: '700' },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 10,
  },
});
