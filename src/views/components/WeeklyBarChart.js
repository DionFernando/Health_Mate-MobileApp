import { StyleSheet, Text, View } from 'react-native';

import { METRICS } from '../../config/constants';
import { spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';
import { todayDb, weekdayShort } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/format';

const CHART_HEIGHT = 150;

export default function WeeklyBarChart({ week, metricKey, goal }) {
  const colors = useThemeColors();
  const m = METRICS[metricKey];
  const values = week.map((d) => d[metricKey]);
  const max = Math.max(goal, ...values, 1) * 1.1;
  const today = todayDb();
  const goalBottom = (goal / max) * CHART_HEIGHT;

  return (
    <View accessible accessibilityLabel={`${m.label} for the last 7 days`}>
      <View style={[styles.chart, { height: CHART_HEIGHT }]}>
        <View style={[styles.goalLine, { bottom: goalBottom, borderColor: m.color }]} />
        <Text style={[styles.goalLabel, { bottom: goalBottom + 2, color: m.color }]}>Goal</Text>
        {week.map((d) => {
          const v = d[metricKey];
          const h = Math.max((v / max) * CHART_HEIGHT, v > 0 ? 4 : 0);
          return (
            <View key={d.date} style={styles.barSlot}>
              <Text style={[styles.barValue, { color: colors.textMuted }]} numberOfLines={1}>
                {v > 0 ? (v >= 10000 ? `${Math.round(v / 1000)}k` : formatNumber(v)) : ''}
              </Text>
              <View
                style={[
                  styles.bar,
                  { height: h, backgroundColor: m.color, opacity: v >= goal ? 1 : 0.5 },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {week.map((d) => (
          <Text
            key={d.date}
            style={[
              styles.dayLabel,
              { color: d.date === today ? colors.text : colors.textMuted },
              d.date === today && { fontWeight: '800' },
            ]}
          >
            {d.date === today ? 'Today' : weekdayShort(d.date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.lg },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed', opacity: 0.7 },
  goalLabel: { position: 'absolute', right: 0, fontSize: 10, fontWeight: '700' },
  barSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 9.5, marginBottom: 2 },
  bar: { width: 20, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  labels: { flexDirection: 'row', marginTop: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11.5 },
});
