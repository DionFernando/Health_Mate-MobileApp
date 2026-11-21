export const APP_NAME = 'HealthMate';
export const APP_VERSION = '1.0.0';

export const DB_NAME = 'healthmate.db';
export const TABLE_HEALTH_RECORDS = 'health_records';

export const LIMITS = {
  steps: 100000,
  calories: 10000,
  water: 10000, 
};

export const DEFAULT_GOALS = {
  steps: 10000,
  calories: 500,
  water: 2500,
};

export const STORAGE_KEYS = {
  settings: '@healthmate/settings',
};

export const METRICS = {
  steps: {
    key: 'steps',
    label: 'Steps',
    longLabel: 'Steps Walked',
    unit: 'steps',
    icon: 'shoe-print',
    color: '#43A047',
  },
  calories: {
    key: 'calories',
    label: 'Calories',
    longLabel: 'Calories Burned',
    unit: 'kcal',
    icon: 'fire',
    color: '#E53935',
  },
  water: {
    key: 'water',
    label: 'Water',
    longLabel: 'Water Intake',
    unit: 'ml',
    icon: 'water',
    color: '#1E88E5',
  },
};

export const METRIC_KEYS = ['steps', 'calories', 'water'];
