import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';
import { relativeLabel, todayDb } from '../../utils/dateUtils';
import Card from './Card';
import MetricChip from './MetricChip';

export default function RecordCard({ record, onEdit, onDelete }) {
  const colors = useThemeColors();
  const isToday = record.date === todayDb();

  return (
    <Pressable onPress={onEdit} accessibilityHint="Opens the record for editing">
      {({ pressed }) => (
        <Card style={[styles.card, pressed && { opacity: 0.85 }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
            <Text style={[styles.date, { color: colors.text }]}>{relativeLabel(record.date)}</Text>
            {isToday && (
              <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>TODAY</Text>
              </View>
            )}
            <Pressable
              testID={`edit-${record.id}`}
              accessibilityRole="button"
              accessibilityLabel="Edit record"
              hitSlop={8}
              onPress={onEdit}
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons name="pencil-outline" size={21} color={colors.textMuted} />
            </Pressable>
            <Pressable
              testID={`delete-${record.id}`}
              accessibilityRole="button"
              accessibilityLabel="Delete record"
              hitSlop={8}
              onPress={onDelete}
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons name="delete-outline" size={21} color={colors.danger} />
            </Pressable>
          </View>
          <View style={styles.chips}>
            <MetricChip metricKey="steps" value={record.steps} />
            <MetricChip metricKey="calories" value={record.calories} />
            <MetricChip metricKey="water" value={record.water} />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  date: { flex: 1, fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  iconBtn: { padding: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
