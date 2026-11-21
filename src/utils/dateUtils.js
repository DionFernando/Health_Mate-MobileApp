const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n) => String(n).padStart(2, '0');

export function toDbDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDbDate(text) {
  const [y, m, d] = text.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidDbDate(text) {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  return toDbDate(fromDbDate(text)) === text;
}

export function todayDb() {
  return toDbDate(new Date());
}

export function addDays(dbDate, days) {
  const d = fromDbDate(dbDate);
  return toDbDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}

export function formatLong(dbDate) {
  const d = fromDbDate(dbDate);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShort(dbDate) {
  const d = fromDbDate(dbDate);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function weekdayShort(dbDate) {
  return DAYS[fromDbDate(dbDate).getDay()];
}

export function relativeLabel(dbDate, today = todayDb()) {
  if (dbDate === today) return 'Today';
  if (dbDate === addDays(today, -1)) return 'Yesterday';
  return formatShort(dbDate);
}

export function startOfMonth(dbDate) {
  return `${dbDate.slice(0, 7)}-01`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
