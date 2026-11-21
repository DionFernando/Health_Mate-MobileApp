import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';

export default function FloatingButton({ label, icon = 'plus', onPress, testID }) {
  const colors = useThemeColors();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.onPrimary} />
      <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: radius.lg,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  label: { fontSize: 16, fontWeight: '700' },
});
