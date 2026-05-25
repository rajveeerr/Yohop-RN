import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PartnerFanValue = 'partners' | 'fans';

export function PartnerFanToggle({
  value,
  onChange,
}: {
  value: PartnerFanValue;
  onChange: (v: PartnerFanValue) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.helperLabel}>Are you</Text>
      <View style={styles.track}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onChange('partners')}
          style={[styles.option, value === 'partners' && styles.optionActive]}>
          <Text style={[styles.optionText, value === 'partners' && styles.optionTextActive]}>
            Partners
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onChange('fans')}
          style={[styles.option, value === 'fans' && styles.optionActive]}>
          <Text style={[styles.optionText, value === 'fans' && styles.optionTextActive]}>
            Fans
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  helperLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginBottom: 6,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 26,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 22,
  },
  optionActive: {
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  optionTextActive: {
    color: '#000',
    fontWeight: '700',
  },
});
