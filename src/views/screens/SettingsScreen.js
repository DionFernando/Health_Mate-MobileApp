import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { APP_NAME, APP_VERSION, LIMITS, METRICS, METRIC_KEYS } from '../../config/constants';
import { spacing } from '../../config/theme';
import { useRecordController } from '../../controllers/RecordController';
import { useSettingsController } from '../../controllers/SettingsController';
import { useAppContext } from '../../store/AppContext';
import { formatNumber } from '../../utils/format';
import { showToast } from '../../utils/toast';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import FormField from '../components/FormField';
import SegmentedControl from '../components/SegmentedControl';

export default function SettingsScreen() {
  const { colors } = useAppContext();
  const settingsCtrl = useSettingsController();
  const recordCtrl = useRecordController();
  const { goals, themeMode } = settingsCtrl.settings;

  const [goalForm, setGoalForm] = useState(toForm(goals));
  const [errors, setErrors] = useState({});

  const saveGoals = async () => {
    const result = await settingsCtrl.updateGoals(goalForm);
    setErrors(result.errors);
    if (result.ok) showToast('Daily goals saved');
  };

  const resetData = () => {
    Alert.alert(
      'Reset to sample data?',
      'All of your records will be deleted and replaced with 14 days of sample data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const ok = await recordCtrl.resetToSampleData();
            showToast(ok ? 'Sample data restored' : 'Reset failed');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Section title="Appearance" color={colors.primary} />
      <SegmentedControl
        testID="theme-control"
        value={themeMode}
        onChange={settingsCtrl.setThemeMode}
        options={[
          { value: 'system', label: 'System', icon: 'theme-light-dark' },
          { value: 'light', label: 'Light', icon: 'weather-sunny' },
          { value: 'dark', label: 'Dark', icon: 'weather-night' },
        ]}
      />

      <Section title="Daily goals" color={colors.primary} />
      <Card>
        {METRIC_KEYS.map((key) => (
          <FormField
            key={key}
            testID={`goal-${key}`}
            label={`${METRICS[key].label} goal`}
            icon={METRICS[key].icon}
            iconColor={METRICS[key].color}
            unit={METRICS[key].unit}
            helper={`Current: ${formatNumber(goals[key])} ${METRICS[key].unit}`}
            value={goalForm[key]}
            error={errors[key]}
            onChangeText={(v) => {
              setGoalForm((f) => ({ ...f, [key]: v }));
              setErrors((e) => ({ ...e, [key]: undefined }));
            }}
          />
        ))}
        <AppButton title="Save goals" icon="flag-outline" onPress={saveGoals} testID="save-goals" />
      </Card>

      <Section title="Data" color={colors.primary} />
      <Row
        icon="restore"
        title="Reset to sample data"
        subtitle="Replace all records with 14 days of demo data"
        onPress={resetData}
      />

      <Section title="About" color={colors.primary} />
      <Row
        icon="heart-pulse"
        title={APP_NAME}
        subtitle={`Personal Health & Wellness Tracker • v${APP_VERSION}`}
        onPress={() =>
          Alert.alert(APP_NAME, `Version ${APP_VERSION}\n\nTrack your daily steps, calories burned and water intake. Limits per entry: ${formatNumber(LIMITS.steps)} steps, ${formatNumber(LIMITS.calories)} kcal, ${formatNumber(LIMITS.water)} ml.`)
        }
      />
    </ScrollView>
  );
}

const toForm = (goals) => ({
  steps: String(goals.steps),
  calories: String(goals.calories),
  water: String(goals.water),
});

function Section({ title, color }) {
  return <Text style={[styles.section, { color }]}>{title.toUpperCase()}</Text>;
}

function Row({ icon, title, subtitle, onPress }) {
  const { colors } = useAppContext();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.row, pressed && { opacity: 0.8 }]}>
          <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { fontSize: 12.5, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.xl, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
});
