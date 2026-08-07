export function generateId() {
  return crypto.randomUUID();
}

export function getAverageRating(ratings) {
  const values = Object.values(ratings || {}).filter(
    (v) => typeof v === 'number' && v >= 0
  );
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function getRatingCount(ratings) {
  return Object.values(ratings || {}).filter(
    (v) => typeof v === 'number' && v >= 0
  ).length;
}
