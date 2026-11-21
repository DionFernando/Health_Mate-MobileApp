import { LIMITS, METRICS } from '../config/constants';
import { isValidDbDate, todayDb } from '../utils/dateUtils';
import { validateWholeNumber } from '../utils/validators';

export function createHealthRecord({ id = null, date, steps = 0, calories = 0, water = 0 }) {
  return {
    id: id === null || id === undefined ? null : Number(id),
    date,
    steps: Math.trunc(Number(steps) || 0),
    calories: Math.trunc(Number(calories) || 0),
    water: Math.trunc(Number(water) || 0),
  };
}

export function fromRow(row) {
  return createHealthRecord(row);
}

export function toParams(record) {
  return [record.date, record.steps, record.calories, record.water];
}

export function validateRecordInput(input, today = todayDb()) {
  const errors = {};

  if (!input.date || !isValidDbDate(input.date)) {
    errors.date = 'Please choose a valid date';
  } else if (input.date > today) {
    errors.date = 'Date cannot be in the future';
  }

  for (const key of ['steps', 'calories', 'water']) {
    const message = validateWholeNumber(input[key], {
      fieldName: METRICS[key].label,
      max: LIMITS[key],
    });
    if (message) errors[key] = message;
  }

  // Business rule: an entry where every value is zero is meaningless.
  if (
    !errors.steps && !errors.calories && !errors.water &&
    Number(input.steps) === 0 && Number(input.calories) === 0 && Number(input.water) === 0
  ) {
    errors.form = 'Enter at least one value greater than 0';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
