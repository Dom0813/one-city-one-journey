import { describe, it, expect } from 'vitest';
import { DEFAULT_DATA } from '../src/data/sample.js';
import { validateData, resolve } from '../src/lib/data.js';

describe('Data Validation & Place Resolution Tests', () => {
  it('default sample data has zero validation errors', () => {
    const errors = validateData(DEFAULT_DATA);
    expect(errors).toEqual([]);
    expect(errors.length).toBe(0);
  });

  it('detects invalid metro station name and returns clear error', () => {
    const badData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    badData.places.Chandkheda.opts[0].st = 'Nowhere';
    const errors = validateData(badData);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('unknown metro station "Nowhere"');
  });

  it('resolves area name first, then metro station', () => {
    const areaRes = resolve('Naroda', DEFAULT_DATA);
    expect(areaRes).not.toBeNull();
    expect(areaRes.type).toBe('area');
    expect(areaRes.name).toBe('Naroda');

    const stationRes = resolve('Kalupur', DEFAULT_DATA);
    expect(stationRes).not.toBeNull();
    expect(stationRes.type).toBe('station');
    expect(stationRes.name).toBe('Kalupur Railway Station');
  });
});
