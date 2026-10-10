// Station search and fuzzy matching
// Source of truth: reference/index.html

import { ALL, ALIAS } from '../data/metro.js';

export const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const BYLEN = [...ALL].sort((a, b) => b.length - a.length);

export const hasWord = (t, w) => (' ' + t + ' ').includes(' ' + w + ' ');

export function lev(a, b) {
  const m = [...Array(a.length + 1)].map((_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return m[a.length][b.length];
}

export function findStation(t) {
  t = norm(t);
  if (!t) return null;
  if (ALIAS[t]) return ALIAS[t];
  let m = ALL.find(n => norm(n) === t);
  if (m) return m;
  m = BYLEN.find(n => hasWord(t, norm(n)));
  if (m) return m;
  m = ALL.find(n => t.length >= 3 && norm(n).startsWith(t)) || ALL.find(n => t.length >= 4 && norm(n).includes(t));
  if (m) return m;
  for (const a in ALIAS) {
    if (a.length > 3 && hasWord(t, a)) return ALIAS[a];
  }
  let best = null;
  let bd = 99;
  ALL.forEach(n => {
    const x = norm(n);
    const d = lev(x, t);
    if (d < bd) {
      bd = d;
      best = n;
    }
  });
  return bd <= Math.max(1, Math.floor(t.length / 4)) ? best : null;
}
