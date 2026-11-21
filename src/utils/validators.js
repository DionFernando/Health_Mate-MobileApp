export function validateWholeNumber(value, { fieldName, max }) {
  const text = value === null || value === undefined ? '' : String(value).trim();
  if (text === '') return `${fieldName} is required`;
  if (!/^-?\d+$/.test(text)) return 'Enter a valid whole number';
  const n = Number(text);
  if (n < 0) return `${fieldName} cannot be negative`;
  if (n > max) return `${fieldName} cannot exceed ${max}`;
  return null;
}

export function validateGoal(value, { fieldName, max }) {
  const base = validateWholeNumber(value, { fieldName, max });
  if (base) return base;
  if (Number(String(value).trim()) === 0) return `${fieldName} must be greater than 0`;
  return null;
}
