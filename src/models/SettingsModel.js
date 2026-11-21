import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_GOALS, STORAGE_KEYS } from '../config/constants';

export const DEFAULT_SETTINGS = {
  themeMode: 'system',
  goals: { ...DEFAULT_GOALS },
};

export default class SettingsModel {
  constructor(storage = AsyncStorage) {
    this.storage = storage;
  }

  async load() {
    try {
      const json = await this.storage.getItem(STORAGE_KEYS.settings);
      if (!json) return { ...DEFAULT_SETTINGS, goals: { ...DEFAULT_GOALS } };
      const saved = JSON.parse(json);
      return {
        themeMode: saved.themeMode || DEFAULT_SETTINGS.themeMode,
        goals: { ...DEFAULT_GOALS, ...(saved.goals || {}) },
      };
    } catch {
      return { ...DEFAULT_SETTINGS, goals: { ...DEFAULT_GOALS } };
    }
  }

  async save(settings) {
    await this.storage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }
}
