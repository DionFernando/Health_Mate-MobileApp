import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { METRICS } from '../../config/constants';
import { radius, spacing } from '../../config/theme';
import { useRecordController } from '../../controllers/RecordController';
import { useAppContext } from '../../store/AppContext';
import { addDays, formatLong, formatShort, startOfMonth, todayDb } from '../../utils/dateUtils';
import { formatMetric } from '../../utils/format';
import AppButton from '../components/AppButton';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FloatingButton from '../components/FloatingButton';
import RecordCard from '../components/RecordCard';
import SegmentedControl from '../components/SegmentedControl';
import UndoBar from '../components/UndoBar';

export default function RecordListScreen({ navigation }) {
  const { colors } = useAppContext();
  const ctrl = useRecordController();
  const [mode, setMode] = useState('single'); 
  const [refreshing, setRefreshing] = useState(false);
  const [undo, setUndo] = useState(null); 
  const undoTimer = useRef(null);
  const today = todayDb();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ctrl.sortNewestFirst ? 'Sort oldest first' : 'Sort newest first'}
          onPress={ctrl.toggleSort}
          hitSlop={10}
          style={{ marginRight: spacing.lg }}
        >
          <MaterialCommunityIcons
            name={ctrl.sortNewestFirst ? 'sort-calendar-descending' : 'sort-calendar-ascending'}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>
      ),
    });
  }, [navigation, ctrl.sortNewestFirst, ctrl.toggleSort, colors.text]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const openForm = (record) => navigation.navigate('RecordForm', record ? { recordId: record.id } : undefined);

  const confirmDelete = (record) => {
    Alert.alert(
      'Delete record?',
      `Delete the record for ${formatLong(record.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const deleted = await ctrl.deleteRecord(record);
            if (deleted) {
              clearTimeout(undoTimer.current);
              setUndo({ record: deleted });
              undoTimer.current = setTimeout(() => setUndo(null), 5000);
            }
          },
        },
      ],
    );
  };

  const handleUndo = async () => {
    const record = undo?.record;
    setUndo(null);
    clearTimeout(undoTimer.current);
    if (record) await ctrl.restoreRecord(record);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await ctrl.refresh();
    setRefreshing(false);
  };

  const filter = ctrl.filter;
  const filterLabel = filter
    ? filter.from === filter.to
      ? formatShort(filter.from)
      : `${formatShort(filter.from)} – ${formatShort(filter.to)}`
    : null;

  const header = (
    <View>
      {/* ---------- Search / filter panel ---------- */}
      <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Search by date</Text>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'single', label: 'Single date', icon: 'calendar-today' },
            { value: 'range', label: 'Date range', icon: 'calendar-range' },
          ]}
        />
        <View style={styles.filterInputs}>
          {mode === 'single' ? (
            <DateField
              compact
              testID="search-date"
              label="Date"
              value={filter && filter.from === filter.to ? filter.from : null}
              maxDate={today}
              onChange={(d) => ctrl.searchByDate(d)}
            />
          ) : (
            <View style={styles.rangeRow}>
              <View style={styles.flex}>
                <DateField
                  compact
                  label="From"
                  value={filter?.from ?? null}
                  maxDate={today}
                  onChange={(d) => ctrl.filterByRange(d, filter?.to ?? today)}
                />
              </View>
              <View style={styles.flex}>
                <DateField
                  compact
                  label="To"
                  value={filter?.to ?? null}
                  maxDate={today}
                  onChange={(d) => ctrl.filterByRange(filter?.from ?? d, d)}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.quickRow}>
          <QuickChip label="Today" onPress={() => ctrl.searchByDate(today)} />
          <QuickChip label="Last 7 days" onPress={() => ctrl.filterByRange(addDays(today, -6), today)} />
          <QuickChip label="This month" onPress={() => ctrl.filterByRange(startOfMonth(today), today)} />
        </View>
      </View>

      {/* ---------- Active filter summary ---------- */}
      {filter && (
        <View testID="filter-banner" style={[styles.banner, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              {filterLabel} • {ctrl.records.length} record{ctrl.records.length === 1 ? '' : 's'}
            </Text>
            <Text style={[styles.bannerTotals, { color: colors.textMuted }]}>
              Totals: {formatMetric(ctrl.totals.steps, METRICS.steps.unit)} ·{' '}
              {formatMetric(ctrl.totals.calories, METRICS.calories.unit)} ·{' '}
              {formatMetric(ctrl.totals.water, METRICS.water.unit)}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Clear filter" onPress={ctrl.clearFilter} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
      )}

      {ctrl.error ? (
        <Pressable onPress={ctrl.clearError} style={[styles.errorBox, { borderColor: colors.danger }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{ctrl.error}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        testID="record-list"
        data={ctrl.records}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        renderItem={({ item }) => (
          <RecordCard record={item} onEdit={() => openForm(item)} onDelete={() => confirmDelete(item)} />
        )}
        ListEmptyComponent={
          filter ? (
            <EmptyState
              icon="magnify-close"
              title="No records found"
              message="There are no health records for the selected date(s)."
            >
              <AppButton title="Clear filter" icon="close" variant="outline" compact onPress={ctrl.clearFilter} />
            </EmptyState>
          ) : (
            <EmptyState
              icon="note-plus-outline"
              title="No records yet"
              message="Tap “Add Record” to log your first day."
            />
          )
        }
      />
      {!undo && <FloatingButton label="Add Record" testID="fab-add" onPress={() => openForm()} />}
      <UndoBar visible={!!undo} message="Record deleted" actionLabel="UNDO" onAction={handleUndo} />
    </View>
  );
}

function QuickChip({ label, onPress }) {
  const { colors } = useAppContext();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: colors.border, backgroundColor: pressed ? colors.primarySoft : 'transparent' },
      ]}
    >
      <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  flex: { flex: 1 },
  filterPanel: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  panelTitle: { fontSize: 16, fontWeight: '700' },
  filterInputs: {},
  rangeRow: { flexDirection: 'row', gap: spacing.sm },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 13, fontWeight: '600' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerTotals: { fontSize: 12.5, marginTop: 2 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontWeight: '600' },
});
