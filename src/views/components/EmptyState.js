import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';

export default function EmptyState({ icon, title, message, children }) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={72} color={colors.primary} style={{ opacity: 0.6 }} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  title: { fontSize: 20, fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', marginBottom: spacing.md },
});
