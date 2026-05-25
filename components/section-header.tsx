import { StyleSheet, Text, View } from 'react-native';

export function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  bar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#C4F27F',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
