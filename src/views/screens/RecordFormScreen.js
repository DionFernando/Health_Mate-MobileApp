import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';

import { LIMITS, METRICS } from '../../config/constants';
import { radius, spacing } from '../../config/theme';
import { useRecordController } from '../../controllers/RecordController';
import { useAppContext } from '../../store/AppContext';
import { formatLong, todayDb } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/format';
import { showToast } from '../../utils/toast';
import AppButton from '../components/AppButton';
import DateField from '../components/DateField';
import FormField from '../components/FormField';

export default function RecordFormScreen({ navigation, route }) {
  const { colors } = useAppContext();
  const ctrl = useRecordController();
  const recordId = route.params?.recordId ?? null;
  const isEditing = recordId !== null;

  const [form, setForm] = useState({ date: todayDb(), steps: '', calories: '', water: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const caloriesRef = useRef(null);
  const waterRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const record = ctrl.records.find((r) => r.id === recordId) || (await ctrl.getRecord(recordId));
      if (record) {
        setForm({
          date: record.date,
          steps: String(record.steps),
          calories: String(record.calories),
          water: String(record.water),
        });
      } else {
        Alert.alert('Not found', 'This record no longer exists.');
        navigation.goBack();
      }
      setLoadingRecord(false);
    })();
  }, [recordId]);

  const handleDelete = () => {
    Alert.alert('Delete record?', `Delete the record for ${formatLong(form.date)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const deleted = await ctrl.deleteRecord({ id: recordId, ...form });
          if (deleted) {
            showToast('Record deleted');
            navigation.goBack();
          } else {
            Alert.alert('Error', 'Could not delete the record.');
          }
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Record' : 'Add Record',
      headerRight: isEditing
        ? () => (
            <Pressable accessibilityRole="button" accessibilityLabel="Delete record" onPress={handleDelete} hitSlop={10}>
              <MaterialCommunityIcons name="delete-outline" size={24} color={colors.danger} />
            </Pressable>
          )
        : undefined,
    });
  });

  const update = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
  };

  const addWater = (ml) => {
    const current = Number(form.water) || 0;
    update('water')(String(Math.min(current + ml, LIMITS.water)));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await ctrl.saveRecord(form, recordId);
    setSaving(false);
    if (result.ok) {
      showToast(isEditing ? 'Record updated' : 'Record added');
      navigation.goBack();
    } else {
      setErrors(result.errors);
    }
  };

  if (loadingRecord) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <DateField
          testID="date-field"
          label="Date"
          value={form.date}
          maxDate={todayDb()}
          error={errors.date}
          onChange={update('date')}
        />
        <FormField
          testID="steps-input"
          label={METRICS.steps.longLabel}
          icon={METRICS.steps.icon}
          iconColor={METRICS.steps.color}
          unit={METRICS.steps.unit}
          placeholder="e.g. 7850"
          helper={`0 – ${formatNumber(LIMITS.steps)} steps`}
          value={form.steps}
          error={errors.steps}
          onChangeText={update('steps')}
          onSubmitEditing={() => caloriesRef.current?.focus()}
        />
        <FormField
          testID="calories-input"
          inputRef={caloriesRef}
          label={METRICS.calories.longLabel}
          icon={METRICS.calories.icon}
          iconColor={METRICS.calories.color}
          unit={METRICS.calories.unit}
          placeholder="e.g. 420"
          helper={`0 – ${formatNumber(LIMITS.calories)} kcal`}
          value={form.calories}
          error={errors.calories}
          onChangeText={update('calories')}
          onSubmitEditing={() => waterRef.current?.focus()}
        />
        <FormField
          testID="water-input"
          inputRef={waterRef}
          label={METRICS.water.longLabel}
          icon={METRICS.water.icon}
          iconColor={METRICS.water.color}
          unit={METRICS.water.unit}
          placeholder="e.g. 2000"
          helper={`0 – ${formatNumber(LIMITS.water)} ml`}
          value={form.water}
          error={errors.water}
          onChangeText={update('water')}
          returnKeyType="done"
        />
        <View style={styles.waterChips}>
          {[250, 500, 1000].map((ml) => (
            <Pressable
              key={ml}
              testID={`add-water-${ml}`}
              accessibilityRole="button"
              accessibilityLabel={`Add ${ml} millilitres`}
              onPress={() => addWater(ml)}
              style={[styles.chip, { borderColor: METRICS.water.color }]}
            >
              <MaterialCommunityIcons name="plus" size={16} color={METRICS.water.color} />
              <Text style={[styles.chipText, { color: METRICS.water.color }]}>{ml} ml</Text>
            </Pressable>
          ))}
        </View>

        {errors.form ? (
          <Text testID="form-error" style={[styles.formError, { color: colors.danger }]}>{errors.form}</Text>
        ) : null}

        <AppButton
          testID="save-button"
          title={isEditing ? 'Update Record' : 'Save Record'}
          icon="check"
          loading={saving}
          onPress={handleSave}
          style={styles.save}
        />
        {isEditing && (
          <AppButton title="Delete Record" icon="delete-outline" variant="text" color={colors.danger} onPress={handleDelete} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl },
  waterChips: { flexDirection: 'row', gap: spacing.sm, marginTop: -spacing.sm, marginBottom: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontWeight: '700', fontSize: 13 },
  formError: { textAlign: 'center', fontWeight: '600', marginBottom: spacing.md },
  save: { marginTop: spacing.sm, marginBottom: spacing.sm },
});
