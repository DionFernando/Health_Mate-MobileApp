import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';

export default function AppButton({
  title, onPress, icon, variant = 'primary', loading = false, disabled = false,
  color, style, testID, compact = false,
}) {
  const colors = useThemeColors();
  const tint = color || (variant === 'danger' ? colors.danger : colors.primary);
  const filled = variant === 'primary' || variant === 'danger';
  const fg = filled ? '#FFFFFF' : tint;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        filled && { backgroundColor: tint },
        variant === 'outline' && { borderWidth: 1.5, borderColor: tint },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <MaterialCommunityIcons name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  compact: { minHeight: 40, paddingHorizontal: spacing.md },
  label: { fontSize: 16, fontWeight: '600' },
});
