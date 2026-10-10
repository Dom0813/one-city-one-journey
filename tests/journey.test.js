import { describe, it, expect } from 'vitest';
import { journeys, splitOf } from '../src/lib/journey.js';
import { DEFAULT_DATA } from '../src/data/sample.js';

describe('Multimodal Journey Engine & Fare Splitting Tests', () => {
  it('Naroda to GIFT City: own tickets ₹55, One Journey fare ₹50', () => {
    const list = journeys('Naroda', 'GIFT City', DEFAULT_DATA);
    expect(list.length).toBeGreaterThan(0);
    const top = list[0];
    expect(top.ownTickets).toBe(55);
    expect(top.oneFare).toBe(50);
    expect(top.savings).toBe(5);
  });

  it('Chandkheda to Paldi: own tickets ₹30, One Journey fare ₹27', () => {
    const list = journeys('Chandkheda', 'Paldi', DEFAULT_DATA);
    expect(list.length).toBeGreaterThan(0);
    const top = list[0];
    expect(top.ownTickets).toBe(30);
    expect(top.oneFare).toBe(27);
  });

  it('Satellite to Motera Stadium: own tickets ₹30, One Journey fare ₹27', () => {
    const list = journeys('Satellite', 'Motera Stadium', DEFAULT_DATA);
    expect(list.length).toBeGreaterThan(0);
    const top = list[0];
    expect(top.ownTickets).toBe(30);
    expect(top.oneFare).toBe(27);
  });

  it('Paldi to Kalupur Railway Station: metro only, ₹15, no discount', () => {
    const list = journeys('Paldi', 'Kalupur Railway Station', DEFAULT_DATA);
    expect(list.length).toBeGreaterThan(0);
    const top = list[0];
    expect(top.ownTickets).toBe(15);
    expect(top.oneFare).toBe(15);
    expect(top.savings).toBe(0);
  });

  it('Splits always strictly sum to the One Journey fare for both fare and distance methods', () => {
    const list = journeys('Naroda', 'GIFT City', DEFAULT_DATA);
    const j = list[0];

    const fareSplits = splitOf(j.operators, j.oneFare, j.ownTickets, 'fare');
    const fareSum = fareSplits.reduce((acc, o) => acc + o.share, 0);
    expect(fareSum).toBe(j.oneFare);

    const distSplits = splitOf(j.operators, j.oneFare, j.ownTickets, 'dist');
    const distSum = distSplits.reduce((acc, o) => acc + o.share, 0);
    expect(distSum).toBe(j.oneFare);
  });
});
