import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';
import { formatLong, fromDbDate, toDbDate } from '../../utils/dateUtils';

export default function DateField({ label, value, onChange, maxDate, error, testID, compact = false }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  const handleChange = (event, selected) => {  
    setOpen(false);
    if (event.type === 'set' && selected) onChange(toDbDate(selected));
  };

  return (
    <View style={compact ? null : styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Date'}: ${value ? formatLong(value) : 'not set'}. Tap to change`}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          compact && styles.compactField,
          { borderColor: error ? colors.danger : colors.border, backgroundColor: colors.inputBackground },
        ]}
      >
        <MaterialCommunityIcons name="calendar" size={compact ? 18 : 22} color={colors.primary} />
        <Text style={[styles.value, compact && { fontSize: 14 }, { color: colors.text }]}>
          {value ? formatLong(value) : 'Select date'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      {open && (
        <DateTimePicker
          value={value ? fromDbDate(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maxDate ? fromDbDate(maxDate) : undefined}
          minimumDate={new Date(2020, 0, 1)}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  compactField: { minHeight: 42, paddingHorizontal: spacing.sm },
  value: { flex: 1, fontSize: 17 },
  error: { fontSize: 12.5, marginTop: 4, fontWeight: '500' },
});
