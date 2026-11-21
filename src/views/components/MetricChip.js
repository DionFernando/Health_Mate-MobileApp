import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { METRICS } from '../../config/constants';
import { radius } from '../../config/theme';
import { formatMetric } from '../../utils/format';

export default function MetricChip({ metricKey, value }) {
  const m = METRICS[metricKey];
  return (
    <View
      accessible
      accessibilityLabel={`${m.longLabel}: ${formatMetric(value, m.unit)}`}
      style={[styles.chip, { backgroundColor: `${m.color}1F` }]}
    >
      <MaterialCommunityIcons name={m.icon} size={15} color={m.color} />
      <Text style={[styles.text, { color: m.color }]}>{formatMetric(value, m.unit)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  text: { fontSize: 12.5, fontWeight: '700' },
});
