export function formatNumber(value) {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? '-' : '';
  return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMetric(value, unit) {
  return `${formatNumber(value)} ${unit}`;
}
