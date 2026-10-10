// Crowd predictor logic
// Source of truth: reference/index.html

const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function crowd(n, d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  const g = (m, s) => Math.exp(-(((h - m) / s) ** 2));
  return Math.min(1, 0.18 + 0.62 * Math.max(g(9, 1.6), g(18.5, 1.8)) + (hash(n) % 30) / 100 * 0.5);
}

export const lvl = v => (v < 0.4 ? ['Low', '#34D399'] : v < 0.7 ? ['Medium', '#F2A33A'] : ['High', '#F43F5E']);

export function coaches(n) {
  const v = crowd(n);
  const m = Math.floor(Date.now() / 60000);
  return [0, 1, 2, 3, 4, 5].map(i => Math.max(0.05, Math.min(1, v + 0.28 * Math.sin(i * 2.1 + m / 5))));
}
