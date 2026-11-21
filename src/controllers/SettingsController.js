import { useMemo } from 'react';

import { LIMITS, METRICS, METRIC_KEYS } from '../config/constants';
import { ActionTypes } from '../store/appReducer';
import { useAppContext } from '../store/AppContext';
import { validateGoal } from '../utils/validators';

export function validateGoals(input) {
  const errors = {};
  const goals = {};
  for (const key of METRIC_KEYS) {
    const message = validateGoal(input[key], { fieldName: METRICS[key].label, max: LIMITS[key] });
    if (message) errors[key] = message;
    else goals[key] = Number(String(input[key]).trim());
  }
  return { isValid: Object.keys(errors).length === 0, errors, goals };
}

export function createSettingsController({ model, dispatch, getSettings }) {
  async function persist(settings) {
    dispatch({ type: ActionTypes.SETTINGS_UPDATED, settings });
    try {
      await model.save(settings);
      return true;
    } catch (e) {
      console.warn('Saving settings failed', e);
      return false;
    }
  }

  return {
    setThemeMode(themeMode) {
      return persist({ ...getSettings(), themeMode });
    },
    async updateGoals(input) {
      const { isValid, errors, goals } = validateGoals(input);
      if (!isValid) return { ok: false, errors };
      await persist({ ...getSettings(), goals });
      return { ok: true, errors: {} };
    },
  };
}

export function useSettingsController() {
  const { state, dispatch, models } = useAppContext();
  const { settings } = state;
  const controller = useMemo(
    () => createSettingsController({ model: models.settings, dispatch, getSettings: () => settings }),
    [models.settings, dispatch, settings],
  );
  return { ...controller, settings };
}
