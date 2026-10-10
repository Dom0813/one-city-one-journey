// Multimodal journey engine, routing, fares and fare-split logic
// Source of truth: reference/index.html & PS-08 One City, One Journey specifications

import { LINES } from '../data/metro.js';
import { plan } from './route.js';
import { loadData, resolve } from './data.js';

export function metroFare(km, data = loadData()) {
  const slabs = data.fares?.metro || [
    [2, 5],
    [5, 10],
    [12, 15],
    [22, 20],
    [9999, 25]
  ];
  const match = slabs.find(s => km <= s[0]);
  return match ? match[1] : 25;
}

export function busFare(opt, data = loadData()) {
  if (!opt || opt.mode === 'WALK') return 0;
  const slabs = opt.mode === 'BRTS' ? data.fares?.brts : data.fares?.amts;
  if (!slabs) return 10;
  const match = slabs.find(s => opt.stops <= s[0]);
  return match ? match[1] : 20;
}

export function accessOpts(target, data = loadData()) {
  if (!target) return [];

  // If target is an area name or object
  let place = null;
  let stationName = null;

  if (typeof target === 'string') {
    const res = resolve(target, data);
    if (res?.type === 'area') place = res.place;
    else if (res?.type === 'station') stationName = res.name;
    else stationName = target;
  } else if (target.type === 'area') {
    place = target.place;
  } else if (target.type === 'station') {
    stationName = target.name;
  } else if (target.opts) {
    place = target;
  }

  if (place) {
    const list = [...(place.opts || [])].map(o => ({ ...o }));
    if (place.walk) {
      list.push({
        mode: 'WALK',
        route: 'Direct walk',
        st: place.walk.st,
        ride: 0,
        stops: 0,
        ws: 0,
        xfer: 0,
        head: 0,
        walkMin: place.walk.min
      });
    }
    return list;
  }

  if (stationName) {
    return [
      {
        mode: 'WALK',
        route: 'Direct walk',
        st: stationName,
        ride: 0,
        stops: 0,
        ws: 0,
        xfer: 0,
        head: 0,
        walkMin: 0
      }
    ];
  }

  return [];
}

export function splitOf(ops, unified, sum, by = 'fare') {
  if (!ops || ops.length === 0) return [];
  if (ops.length === 1) {
    return [{ ...ops[0], share: unified, rawShare: unified }];
  }

  const totalBase = by === 'fare' ? sum : ops.reduce((acc, o) => acc + (o.km || 0), 0) || 1;

  let assigned = 0;
  const rawList = ops.map(o => {
    const baseVal = by === 'fare' ? o.fare : (o.km || 0);
    const raw = (unified * baseVal) / totalBase;
    const rounded = Math.floor(raw);
    assigned += rounded;
    return {
      ...o,
      rawShare: +raw.toFixed(2),
      share: rounded,
      rem: raw - rounded
    };
  });

  // Distribute remainder so shares strictly add up to unified
  let remainder = unified - assigned;
  rawList.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < remainder; i++) {
    rawList[i % rawList.length].share += 1;
  }

  // Restore original ordering
  return ops.map(o => rawList.find(x => x.name === o.name));
}

export function buildJourney(fromName, toName, originOpt, destOpt, metroRoute, data = loadData()) {
  const steps = [];
  const kmPerStop = data.fares?.kmPerStop || 0.9;
  let walkMin = 0;
  let totalMin = 0;
  let busMetroTransfers = 0;

  // 1. Origin End
  if (originOpt.mode === 'WALK') {
    if (originOpt.walkMin > 0) {
      steps.push({
        type: 'walk',
        mode: 'WALK',
        text: `Walk to ${originOpt.st} Metro Station`,
        min: originOpt.walkMin
      });
      walkMin += originOpt.walkMin;
      totalMin += originOpt.walkMin;
    }
  } else {
    // Bus access
    steps.push({
      type: 'walk',
      mode: 'WALK',
      text: `Walk to ${originOpt.route} stop`,
      min: originOpt.ws
    });
    walkMin += originOpt.ws;
    totalMin += originOpt.ws;

    const waitBus = Math.max(2, Math.round(originOpt.head / 2));
    steps.push({
      type: 'wait',
      mode: 'WAIT',
      text: `Wait for ${originOpt.route} (${originOpt.mode})`,
      min: waitBus
    });
    totalMin += waitBus;

    steps.push({
      type: 'bus',
      mode: originOpt.mode,
      operator: originOpt.mode === 'BRTS' ? 'BRTS (Janmarg)' : 'AMTS',
      route: originOpt.route,
      text: `${originOpt.mode} (${originOpt.route}) towards ${originOpt.st}`,
      min: originOpt.ride,
      stops: originOpt.stops,
      km: +(originOpt.stops * kmPerStop).toFixed(1)
    });
    totalMin += originOpt.ride;

    steps.push({
      type: 'transfer',
      isTransfer: true,
      mode: 'WALK',
      text: `Walk to ${originOpt.st} Metro Station (transfer walk)`,
      min: originOpt.xfer
    });
    walkMin += originOpt.xfer;
    totalMin += originOpt.xfer;
    busMetroTransfers += 1;
  }

  // 2. Metro leg
  steps.push({
    type: 'wait',
    mode: 'WAIT',
    text: 'Wait for Metro train',
    min: 4
  });
  totalMin += 4;

  if (metroRoute && metroRoute.legs) {
    metroRoute.legs.forEach((leg, idx) => {
      if (idx > 0) {
        steps.push({
          type: 'transfer',
          isTransfer: true,
          mode: 'WALK',
          text: `Change to the ${LINES[leg.line].name} (transfer walk)`,
          min: 4
        });
        walkMin += 4;
        totalMin += 4;
      }
      let legTime = 0;
      for (let i = 1; i < leg.stations.length; i++) {
        const fromSt = leg.stations[i - 1];
        const toSt = leg.stations[i];
        const d = Math.hypot(
          (metroRoute.XY?.[fromSt] || [0, 0])[0] - (metroRoute.XY?.[toSt] || [0, 0])[0],
          (metroRoute.XY?.[fromSt] || [0, 0])[1] - (metroRoute.XY?.[toSt] || [0, 0])[1]
        );
        legTime += Math.max(2, Math.round((d * LINES[leg.line].kpx) / 0.55));
      }
      if (legTime === 0) legTime = (leg.stations.length - 1) * 2;

      steps.push({
        type: 'metro',
        mode: 'METRO',
        operator: 'GMRC Metro',
        line: leg.line,
        text: `${LINES[leg.line].name} from ${leg.stations[0]} to ${leg.stations.at(-1)} (${leg.stations.length - 1} stops)`,
        min: legTime,
        stops: leg.stations.length - 1,
        stations: leg.stations
      });
      totalMin += legTime;
    });
  }

  // 3. Destination End
  if (destOpt.mode === 'WALK') {
    if (destOpt.walkMin > 0) {
      steps.push({
        type: 'walk',
        mode: 'WALK',
        text: `Walk to ${toName}`,
        min: destOpt.walkMin
      });
      walkMin += destOpt.walkMin;
      totalMin += destOpt.walkMin;
    }
  } else {
    // Bus egress
    steps.push({
      type: 'transfer',
      isTransfer: true,
      mode: 'WALK',
      text: `Walk to ${destOpt.route} stop (transfer walk)`,
      min: destOpt.xfer
    });
    walkMin += destOpt.xfer;
    totalMin += destOpt.xfer;
    busMetroTransfers += 1;

    const waitBus = Math.max(2, Math.round(destOpt.head / 2));
    steps.push({
      type: 'wait',
      mode: 'WAIT',
      text: `Wait for ${destOpt.route} (${destOpt.mode})`,
      min: waitBus
    });
    totalMin += waitBus;

    steps.push({
      type: 'bus',
      mode: destOpt.mode,
      operator: destOpt.mode === 'BRTS' ? 'BRTS (Janmarg)' : 'AMTS',
      route: destOpt.route,
      text: `${destOpt.mode} (${destOpt.route}) to ${toName}`,
      min: destOpt.ride,
      stops: destOpt.stops,
      km: +(destOpt.stops * kmPerStop).toFixed(1)
    });
    totalMin += destOpt.ride;

    steps.push({
      type: 'walk',
      mode: 'WALK',
      text: `Walk to destination in ${toName}`,
      min: destOpt.ws
    });
    walkMin += destOpt.ws;
    totalMin += destOpt.ws;
  }

  // Fares and Operator breakdown
  const mFare = metroFare(metroRoute.km, data);
  const oFare = busFare(originOpt, data);
  const dFare = busFare(destOpt, data);

  const opMap = {};
  opMap['GMRC Metro'] = {
    name: 'GMRC Metro',
    fare: mFare,
    km: metroRoute.km
  };

  if (originOpt.mode !== 'WALK') {
    const opName = originOpt.mode === 'BRTS' ? 'BRTS (Janmarg)' : 'AMTS';
    const km = +(originOpt.stops * kmPerStop).toFixed(1);
    if (!opMap[opName]) opMap[opName] = { name: opName, fare: 0, km: 0 };
    opMap[opName].fare += oFare;
    opMap[opName].km = +(opMap[opName].km + km).toFixed(1);
  }

  if (destOpt.mode !== 'WALK') {
    const opName = destOpt.mode === 'BRTS' ? 'BRTS (Janmarg)' : 'AMTS';
    const km = +(destOpt.stops * kmPerStop).toFixed(1);
    if (!opMap[opName]) opMap[opName] = { name: opName, fare: 0, km: 0 };
    opMap[opName].fare += dFare;
    opMap[opName].km = +(opMap[opName].km + km).toFixed(1);
  }

  const operators = Object.values(opMap);
  const ownTickets = operators.reduce((s, o) => s + o.fare, 0);
  const discountRate = data.fares?.discount || 0.10;

  // One Journey fare: discounted only when 2 or more operators are used
  const oneFare = operators.length >= 2
    ? Math.round(ownTickets * (1 - discountRate))
    : ownTickets;

  const totalKm = +(operators.reduce((s, o) => s + o.km, 0)).toFixed(1);
  const co2Kg = +(totalKm * 0.09).toFixed(2);

  // Operator splits
  const splitByFare = splitOf(operators, oneFare, ownTickets, 'fare');
  const splitByDist = splitOf(operators, oneFare, ownTickets, 'dist');

  return {
    id: `${fromName}-${toName}-${originOpt.mode}-${originOpt.st}-${destOpt.mode}-${destOpt.st}`,
    from: fromName,
    to: toName,
    originOpt,
    destOpt,
    metroRoute,
    steps,
    totalMinutes: totalMin,
    walkMinutes: walkMin,
    transfers: busMetroTransfers + metroRoute.changes,
    busMetroTransfers,
    ownTickets,
    oneFare,
    savings: ownTickets - oneFare,
    totalKm,
    co2Kg,
    operators,
    splitByFare,
    splitByDist,
    tags: []
  };
}

export function journeys(from, to, data = loadData()) {
  const fromRes = resolve(from, data);
  const toRes = resolve(to, data);
  if (!fromRes || !toRes) return [];

  const fromName = fromRes.name;
  const toName = toRes.name;
  if (fromName === toName) return [];

  const fromOpts = accessOpts(fromRes, data);
  const toOpts = accessOpts(toRes, data);
  const list = [];

  fromOpts.forEach(fOpt => {
    toOpts.forEach(tOpt => {
      // Skip pairs that use the same station
      if (fOpt.st === tOpt.st) return;

      const metroRoute = plan(fOpt.st, tOpt.st, 'fast');
      if (!metroRoute) return;

      const j = buildJourney(fromName, toName, fOpt, tOpt, metroRoute, data);
      list.push(j);
    });
  });

  return rank(list);
}

export function rank(list) {
  if (!list || list.length === 0) return [];

  // Deduplicate by unique combination of (originOpt.route/mode, metro stations, destOpt.route/mode)
  const seen = new Set();
  const unique = [];
  list.forEach(j => {
    const key = `${j.originOpt.mode}-${j.originOpt.st}-${j.destOpt.mode}-${j.destOpt.st}-${j.totalMinutes}-${j.oneFare}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(j);
    }
  });

  if (unique.length === 0) return [];

  // Scoring function: Saathi Pick = time + 0.8 * walk + 0.5 * fare + 4 * transfers
  unique.forEach(j => {
    j.score = j.totalMinutes + 0.8 * j.walkMinutes + 0.5 * j.oneFare + 4 * j.transfers;
  });

  // Find best candidates for each tag
  const sortedByScore = [...unique].sort((a, b) => a.score - b.score);
  const sortedByWalk = [...unique].sort((a, b) => a.walkMinutes - b.walkMinutes);
  const sortedByFare = [...unique].sort((a, b) => a.oneFare - b.oneFare);

  const bestScore = sortedByScore[0];
  const bestWalk = sortedByWalk[0];
  const bestFare = sortedByFare[0];

  bestScore.tags.push('Saathi Pick');
  if (!bestWalk.tags.includes('Walk Less')) bestWalk.tags.push('Walk Less');
  if (!bestFare.tags.includes('Pocket Saver')) bestFare.tags.push('Pocket Saver');

  // Return up to 3 distinct journeys
  const selected = [];
  [bestScore, bestWalk, bestFare].forEach(item => {
    if (!selected.includes(item)) selected.push(item);
  });

  // If fewer than 3, add other fast ones
  sortedByScore.forEach(item => {
    if (selected.length < 3 && !selected.includes(item)) {
      selected.push(item);
    }
  });

  return selected.slice(0, 3);
}
