import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from '../config/theme';
import { getDatabase } from '../database/database';
import HealthRecordModel from '../models/HealthRecordModel';
import SettingsModel from '../models/SettingsModel';
import { ActionTypes, appReducer, initialState } from './appReducer';

const AppContext = createContext(null);

export function AppProvider({ children, recordModel, settingsModel }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [models, setModels] = useState({ records: recordModel || null, settings: settingsModel || null });
  const systemScheme = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const records = recordModel || new HealthRecordModel(await getDatabase());
        const settingsStore = settingsModel || new SettingsModel();
        const settings = await settingsStore.load();
        if (!cancelled) {
          setModels({ records, settings: settingsStore });
          dispatch({ type: ActionTypes.INIT_SUCCESS, settings });
        }
      } catch (e) {
        console.warn('App initialisation failed', e);
        if (!cancelled) {
          dispatch({ type: ActionTypes.INIT_FAILURE, error: 'Could not open the database.' });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recordModel, settingsModel]);

  const mode = state.settings.themeMode === 'system' ? systemScheme : state.settings.themeMode;
  const isDark = mode === 'dark';

  const value = useMemo(
    () => ({
      state,
      dispatch,
      models,
      colors: isDark ? darkColors : lightColors,
      isDark,
    }),
    [state, models, isDark],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}

export function useThemeColors() {
  return useAppContext().colors;
}
