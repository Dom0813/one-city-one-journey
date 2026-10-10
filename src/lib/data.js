// Data layer, persistence, validation and resolution for multimodal places & fares
// Source of truth: PS-08 One City, One Journey

import { DEFAULT_DATA } from '../data/sample.js';
import { ALL } from '../data/metro.js';
import { findStation, norm } from './search.js';

export function loadData() {
  try {
    const raw = localStorage.getItem('ocdata');
    if (raw) {
      const parsed = JSON.parse(raw);
      const errors = validateData(parsed);
      if (errors.length === 0) {
        return parsed;
      }
    }
  } catch {
    // Fall back to sample data on error or unavailable localStorage
  }
  return DEFAULT_DATA;
}

export function saveData(d) {
  try {
    const errors = validateData(d);
    if (errors.length > 0) {
      return { success: false, errors };
    }
    localStorage.setItem('ocdata', JSON.stringify(d));
    return { success: true, errors: [] };
  } catch (e) {
    return { success: false, errors: ['Failed to save to localStorage: ' + e.message] };
  }
}

export function resetData() {
  try {
    localStorage.removeItem('ocdata');
  } catch {
    // ignore
  }
  return DEFAULT_DATA;
}

export function validateData(d) {
  const errors = [];
  if (!d || typeof d !== 'object') {
    return ['Data must be a valid JSON object'];
  }

  // Validate fares
  if (!d.fares || typeof d.fares !== 'object') {
    errors.push('Missing "fares" configuration object');
  } else {
    ['metro', 'brts', 'amts'].forEach(modeKey => {
      if (!Array.isArray(d.fares[modeKey])) {
        errors.push(`Missing or invalid fares slabs for ${modeKey}`);
      } else {
        d.fares[modeKey].forEach((slab, idx) => {
          if (!Array.isArray(slab) || slab.length !== 2 || typeof slab[0] !== 'number' || typeof slab[1] !== 'number') {
            errors.push(`Invalid fare slab format in ${modeKey} at index ${idx}`);
          }
        });
      }
    });

    if (typeof d.fares.discount !== 'number' || d.fares.discount < 0 || d.fares.discount > 1) {
      errors.push('Fares "discount" must be a number between 0 and 1');
    }
    if (typeof d.fares.kmPerStop !== 'number' || d.fares.kmPerStop <= 0) {
      errors.push('Fares "kmPerStop" must be a positive number');
    }
  }

  // Validate places
  if (!d.places || typeof d.places !== 'object') {
    errors.push('Missing "places" configuration object');
  } else {
    const allStationsSet = new Set(ALL);

    Object.entries(d.places).forEach(([placeName, place]) => {
      if (!place || typeof place !== 'object') {
        errors.push(`Place "${placeName}" is not an object`);
        return;
      }

      if (!Array.isArray(place.opts) || place.opts.length === 0) {
        errors.push(`Place "${placeName}" must have a non-empty "opts" array`);
      } else {
        place.opts.forEach((opt, idx) => {
          if (!['BRTS', 'AMTS'].includes(opt.mode)) {
            errors.push(`Place "${placeName}" option #${idx + 1}: mode must be "BRTS" or "AMTS" (got "${opt.mode}")`);
          }
          if (!allStationsSet.has(opt.st)) {
            errors.push(`Place "${placeName}" option #${idx + 1}: unknown metro station "${opt.st}"`);
          }
          ['ride', 'stops', 'ws', 'xfer', 'head'].forEach(field => {
            if (typeof opt[field] !== 'number' || isNaN(opt[field]) || opt[field] < 0) {
              errors.push(`Place "${placeName}" option #${idx + 1}: field "${field}" must be a non-negative number`);
            }
          });
        });
      }

      if (place.walk) {
        if (!allStationsSet.has(place.walk.st)) {
          errors.push(`Place "${placeName}" walk option: unknown metro station "${place.walk.st}"`);
        }
        if (typeof place.walk.min !== 'number' || isNaN(place.walk.min) || place.walk.min < 0) {
          errors.push(`Place "${placeName}" walk option: "min" must be a positive number`);
        }
      }
    });
  }

  return errors;
}

export function resolve(text, currentData = loadData()) {
  const t = norm(text);
  if (!t) return null;

  // 1. Match an area name first
  const places = currentData.places || {};
  const areaKey = Object.keys(places).find(k => norm(k) === t);
  if (areaKey) {
    return { type: 'area', name: areaKey, place: places[areaKey] };
  }

  // Also check if text matches with startsWith or hasWord for area names
  const fuzzyAreaKey = Object.keys(places).find(k => norm(k).startsWith(t) || t.startsWith(norm(k)));
  if (fuzzyAreaKey) {
    return { type: 'area', name: fuzzyAreaKey, place: places[fuzzyAreaKey] };
  }

  // 2. Then match a metro station
  const stationName = findStation(text);
  if (stationName) {
    return { type: 'station', name: stationName };
  }

  return null;
}
