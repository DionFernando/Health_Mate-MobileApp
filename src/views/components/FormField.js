import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';

export default function FormField({
  label, value, onChangeText, icon, iconColor, unit, placeholder, error, helper,
  testID, returnKeyType = 'next', onSubmitEditing, inputRef,
}) {
  const colors = useThemeColors();
  const borderColor = error ? colors.danger : colors.border;
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor, backgroundColor: colors.inputBackground }]}>
        {icon ? <MaterialCommunityIcons name={icon} size={22} color={iconColor || colors.primary} /> : null}
        <TextInput
          ref={inputRef}
          testID={testID}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {unit ? <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text> : null}
      </View>
      {error ? (
        <Text testID={`${testID}-error`} style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : helper ? (
        <Text style={[styles.helper, { color: colors.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: 10 },
  unit: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 12.5, marginTop: 4, fontWeight: '500' },
  helper: { fontSize: 12, marginTop: 4 },
});
