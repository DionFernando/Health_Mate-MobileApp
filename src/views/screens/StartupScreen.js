import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '../../config/constants';
import { useAppContext } from '../../store/AppContext';

export default function StartupScreen() {
  const { state, colors } = useAppContext();
  const failed = state.status === 'failed';
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="heart-pulse" size={72} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>{APP_NAME}</Text>
      {failed ? (
        <Text style={[styles.error, { color: colors.danger }]}>{state.error}</Text>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 28, fontWeight: '800' },
  error: { fontSize: 15, textAlign: 'center' },
});
