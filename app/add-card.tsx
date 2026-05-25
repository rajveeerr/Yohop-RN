import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Field = 'number' | 'exp' | 'cvv' | 'postcode';

type CardState = { number: string; exp: string; cvv: string; postcode: string };

const formatNumber = (digits: string) =>
  digits.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExp = (digits: string) => {
  const d = digits.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function AddCardScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  const [card, setCard] = useState<CardState>({
    number: '',
    exp: '',
    cvv: '',
    postcode: '',
  });
  const [focused, setFocused] = useState<Field>('number');

  const press = (k: string) => {
    setCard((c) => {
      const cur = c[focused];
      if (k === 'back') {
        if (focused === 'number') return { ...c, number: formatNumber(cur.replace(/\D/g, '').slice(0, -1)) };
        if (focused === 'exp') return { ...c, exp: formatExp(cur.replace(/\D/g, '').slice(0, -1)) };
        return { ...c, [focused]: cur.slice(0, -1) };
      }
      if (focused === 'number') return { ...c, number: formatNumber(cur + k) };
      if (focused === 'exp') return { ...c, exp: formatExp(cur + k) };
      if (focused === 'cvv') return { ...c, cvv: (cur + k).slice(0, 4) };
      return { ...c, postcode: (cur + k).slice(0, 10) };
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity hitSlop={10} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add card</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Card</Text>
        <Field
          value={card.number}
          placeholder="Number"
          focused={focused === 'number'}
          onPress={() => setFocused('number')}
        />

        <View style={styles.row2}>
          <View style={styles.half}>
            <Text style={styles.label}>Exp. date</Text>
            <Field
              value={card.exp}
              placeholder="MM/YY"
              focused={focused === 'exp'}
              onPress={() => setFocused('exp')}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>CVV</Text>
            <Field
              value={card.cvv}
              placeholder="123"
              focused={focused === 'cvv'}
              onPress={() => setFocused('cvv')}
              secure
            />
          </View>
        </View>

        <Text style={styles.label}>Country</Text>
        <TouchableOpacity style={styles.countryField} activeOpacity={0.8}>
          <Text style={styles.flag}>🇬🇧</Text>
          <Text style={styles.countryText}>United Kingdom</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.label}>Postcode</Text>
        <Field
          value={card.postcode}
          placeholder=""
          focused={focused === 'postcode'}
          onPress={() => setFocused('postcode')}
        />

        <TouchableOpacity
          style={styles.continue}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: '/placing-order',
              params: { amount: amount ?? '20.04' },
            })
          }>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <NumKey key={n} label={String(n)} onPress={() => press(String(n))} />
        ))}
        <View style={styles.numKey} />
        <NumKey label="0" onPress={() => press('0')} />
        <TouchableOpacity
          style={styles.numKey}
          activeOpacity={0.6}
          onPress={() => press('back')}>
          <Ionicons name="backspace-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({
  value,
  placeholder,
  focused,
  onPress,
  secure,
}: {
  value: string;
  placeholder: string;
  focused: boolean;
  onPress: () => void;
  secure?: boolean;
}) {
  const shown = secure && value ? '•'.repeat(value.length) : value;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.input, focused && styles.inputFocused]}>
      <Text
        style={[
          styles.inputText,
          !value && styles.placeholder,
          focused && styles.inputTextFocused,
        ]}>
        {value ? shown : placeholder}
      </Text>
    </TouchableOpacity>
  );
}

function NumKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.numKey}
      activeOpacity={0.6}
      onPress={onPress}>
      <Text style={styles.numText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  form: { paddingHorizontal: 20, flex: 1 },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  inputFocused: {
    borderColor: '#E91E63',
  },
  inputText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  inputTextFocused: { color: '#E91E63' },
  placeholder: { color: '#6E6E6E', fontWeight: '500' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  countryField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 42,
    borderWidth: 1,
    borderColor: '#222',
  },
  flag: { fontSize: 16 },
  countryText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  continue: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 13,
    alignItems: 'center',
  },
  continueText: { color: '#000', fontSize: 14, fontWeight: '700' },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#1A1A1A',
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  numKey: {
    width: '33.33%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: '#fff', fontSize: 22, fontWeight: '500' },
});
