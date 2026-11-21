import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { METRICS, METRIC_KEYS } from '../../config/constants';
import { spacing } from '../../config/theme';
import { useDashboardController } from '../../controllers/DashboardController';
import { useRecordController } from '../../controllers/RecordController';
import { useAppContext } from '../../store/AppContext';
import { formatLong, greeting } from '../../utils/dateUtils';
import { formatMetric } from '../../utils/format';
import { showToast } from '../../utils/toast';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import FloatingButton from '../components/FloatingButton';
import MetricProgressCard from '../components/MetricProgressCard';
import SegmentedControl from '../components/SegmentedControl';
import WeeklyBarChart from '../components/WeeklyBarChart';

export default function DashboardScreen({ navigation }) {
  const { colors } = useAppContext();
  const dashboard = useDashboardController();
  const records = useRecordController();
  const [chartMetric, setChartMetric] = useState('steps');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await records.refresh();
    setRefreshing(false);
  };

  const addWater = async (ml) => {
    const ok = await records.quickAddWater(ml);
    showToast(ok ? `Added ${ml} ml of water 💧` : 'Could not add water');
  };

  const { today, goals, progress, averages, streak, week } = dashboard;
  const nothingToday = today.entryCount === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting()} 👋</Text>
        <Text testID="today-heading" style={[styles.title, { color: colors.text }]}>
          Today – {formatLong(today.date)}
        </Text>

        {records.error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{records.error}</Text>
        ) : null}

        {METRIC_KEYS.map((key) => (
          <MetricProgressCard
            key={key}
            metricKey={key}
            value={today[key]}
            goal={goals[key]}
            progress={progress[key]}
          />
        ))}
        {nothingToday && (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Nothing logged yet today – tap “Log Activity” to start.
          </Text>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Quick add water</Text>
        <View style={styles.row}>
          <AppButton
            title="+250 ml" icon="water-plus" variant="outline" color={METRICS.water.color}
            style={styles.flex} onPress={() => addWater(250)} testID="quick-water-250"
          />
          <AppButton
            title="+500 ml" icon="water-plus" variant="outline" color={METRICS.water.color}
            style={styles.flex} onPress={() => addWater(500)} testID="quick-water-500"
          />
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Last 7 days</Text>
        <SegmentedControl
          value={chartMetric}
          onChange={setChartMetric}
          options={METRIC_KEYS.map((k) => ({
            value: k, label: METRICS[k].label, icon: METRICS[k].icon, color: METRICS[k].color,
          }))}
        />
        <Card style={styles.chartCard}>
          <WeeklyBarChart week={week} metricKey={chartMetric} goal={goals[chartMetric]} />
        </Card>

        <View style={styles.row}>
          <StatTile icon="lightning-bolt" color={colors.primary} label="Logging streak"
            value={`${streak} day${streak === 1 ? '' : 's'}`} />
          <StatTile icon={METRICS.steps.icon} color={METRICS.steps.color} label="Avg steps"
            value={formatMetric(averages.steps, '')} />
        </View>
        <View style={styles.row}>
          <StatTile icon={METRICS.calories.icon} color={METRICS.calories.color} label="Avg calories"
            value={formatMetric(averages.calories, 'kcal')} />
          <StatTile icon={METRICS.water.icon} color={METRICS.water.color} label="Avg water"
            value={formatMetric(averages.water, 'ml')} />
        </View>
      </ScrollView>
      <FloatingButton label="Log Activity" testID="fab-log" onPress={() => navigation.navigate('RecordForm')} />
    </View>
  );
}

function StatTile({ icon, color, label, value }) {
  const { colors } = useAppContext();
  return (
    <Card style={[styles.flex, styles.stat]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <View style={styles.flex}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{value.trim()}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  greeting: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.lg },
  error: { marginBottom: spacing.md, fontWeight: '600' },
  hint: { textAlign: 'center', fontSize: 13, marginBottom: spacing.sm },
  section: { fontSize: 17, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  flex: { flex: 1 },
  chartCard: { marginTop: spacing.md, marginBottom: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 15, fontWeight: '700' },
});
