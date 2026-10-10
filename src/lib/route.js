// Route planner (Dijkstra over station+line states)
// Source of truth: reference/index.html

import { LINES, XY } from '../data/metro.js';
import { crowd } from './crowd.js';

export const CHANGE_MIN = 4;
export const KM_PER_MIN = 0.55;

export const dist = (a, b) => Math.hypot(XY[a][0] - XY[b][0], XY[a][1] - XY[b][1]);
export const segKm = (a, b, l) => dist(a, b) * LINES[l].kpx;
export const segMin = (a, b, l) => Math.max(2, Math.round(segKm(a, b, l) / KM_PER_MIN));
export const linesAt = n => Object.keys(LINES).filter(k => LINES[k].st.includes(n));
export const fareFor = km => [[2, 5], [5, 10], [12, 15], [22, 20], [1e9, 25]].find(s => km <= s[0])[1];

export function plan(from, to, mode = 'fast') {
  if (!from || !to || from === to) return null;

  // Normalize modes and support aliases (pick -> fast, seat -> quiet, easy -> few)
  const normalizedMode =
    mode === 'pick' ? 'fast' :
    mode === 'seat' ? 'quiet' :
    mode === 'easy' ? 'few' :
    mode;

  const weightsMap = {
    fast: {
      h: (a, b, l) => segMin(a, b, l),
      c: () => CHANGE_MIN
    },
    cheap: {
      h: (a, b, l) => 1 + 0.01 * segMin(a, b, l),
      c: () => 0.1
    },
    few: {
      h: (a, b, l) => segMin(a, b, l),
      c: () => 25
    },
    quiet: {
      h: (a, b, l) => segMin(a, b, l) * (1 + 2 * crowd(b)),
      c: n => CHANGE_MIN + 4 * crowd(n)
    }
  };

  const W = weightsMap[normalizedMode] || weightsMap.fast;
  const key = (n, l) => n + '|' + l;
  const D = {};
  const P = {};
  const done = new Set();
  const Q = [];

  linesAt(from).forEach(l => {
    D[key(from, l)] = 0;
    Q.push([0, from, l]);
  });

  while (Q.length) {
    Q.sort((a, b) => a[0] - b[0]);
    const [d, n, l] = Q.shift();
    const k = key(n, l);
    if (done.has(k)) continue;
    done.add(k);
    if (n === to) break;

    const st = LINES[l].st;
    const i = st.indexOf(n);
    const nb = [];

    [i - 1, i + 1].forEach(j => {
      if (st[j]) nb.push([st[j], l, W.h(n, st[j], l)]);
    });

    linesAt(n).forEach(l2 => {
      if (l2 !== l) nb.push([n, l2, W.c(n)]);
    });

    nb.forEach(([n2, l2, w]) => {
      const k2 = key(n2, l2);
      // Avoid Infinity for JSON safety rule
      const currentD = D[k2] !== undefined ? D[k2] : 999999;
      if (d + w < currentD) {
        D[k2] = d + w;
        P[k2] = k;
        Q.push([d + w, n2, l2]);
      }
    });
  }

  let best = null;
  linesAt(to).forEach(l => {
    const k = key(to, l);
    if (D[k] !== undefined && (best === null || D[k] < D[best])) {
      best = k;
    }
  });

  if (!best) return null;

  const seq = [];
  for (let k = best; k; k = P[k]) {
    const [n, l] = k.split('|');
    seq.unshift({ n, l });
  }

  let legs = [];
  seq.forEach(({ n, l }) => {
    const last = legs[legs.length - 1];
    if (last && last.line === l) {
      if (last.stations.at(-1) !== n) last.stations.push(n);
    } else {
      legs.push({ line: l, stations: [n] });
    }
  });

  legs = legs.filter(x => x.stations.length > 1);

  let stops = 0;
  let time = 0;
  let km = 0;
  legs.forEach(l => {
    stops += l.stations.length - 1;
    for (let i = 1; i < l.stations.length; i++) {
      time += segMin(l.stations[i - 1], l.stations[i], l.line);
      km += segKm(l.stations[i - 1], l.stations[i], l.line);
    }
  });

  const changes = legs.length - 1;
  time += changes * CHANGE_MIN;
  km = +km.toFixed(1);

  return {
    from,
    to,
    legs,
    stops,
    changes,
    time,
    fare: fareFor(km),
    km,
    co2: +(km * 0.09).toFixed(2),
    mode
  };
}
