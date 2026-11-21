import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { METRICS } from '../../config/constants';
import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';
import { formatMetric, formatNumber } from '../../utils/format';
import Card from './Card';

export default function MetricProgressCard({ metricKey, value, goal, progress }) {
  const colors = useThemeColors();
  const m = METRICS[metricKey];
  const reached = goal > 0 && value >= goal;
  const percent = Math.round(progress * 100);

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityLabel={`${m.longLabel}: ${formatMetric(value, m.unit)}, ${percent}% of goal`}
        style={styles.row}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${m.color}22` }]}>
          <MaterialCommunityIcons name={m.icon} size={28} color={m.color} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{m.longLabel}</Text>
          <Text style={[styles.value, { color: m.color }]}>
            {formatNumber(value)}
            <Text style={[styles.unit, { color: colors.text }]}> {m.unit}</Text>
          </Text>
        </View>
        <Text style={[styles.percent, { color: reached ? m.color : colors.textMuted }]}>{percent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: `${m.color}22` }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: m.color }]} />
      </View>
      <Text style={[styles.goal, { color: reached ? m.color : colors.textMuted }]}>
        {reached ? 'Daily goal reached! 🎉' : `Goal: ${formatMetric(goal, m.unit)}`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 26, fontWeight: '800' },
  unit: { fontSize: 14, fontWeight: '500' },
  percent: { fontSize: 15, fontWeight: '700' },
  track: { height: 8, borderRadius: radius.pill, marginTop: spacing.md, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  goal: { fontSize: 12.5, marginTop: 6, fontWeight: '500' },
});
