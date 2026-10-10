import { describe, it, expect } from 'vitest';
import { LINES, ALL } from '../src/data/metro.js';
import { plan } from '../src/lib/route.js';
import { findStation } from '../src/lib/search.js';

describe('Metro Network Data & Route Tests', () => {
  it('has exactly 53 stations in total', () => {
    expect(ALL.length).toBe(53);
  });

  it('has 4 lines with 18, 14, 21, and 3 stations', () => {
    expect(Object.keys(LINES).length).toBe(4);
    expect(LINES.blue.st.length).toBe(18);
    expect(LINES.red.st.length).toBe(14);
    expect(LINES.yellow.st.length).toBe(21);
    expect(LINES.violet.st.length).toBe(3);
  });

  it('computes Paldi to Kalupur Railway Station: Red then Blue, 1 change', () => {
    const route = plan('Paldi', 'Kalupur Railway Station', 'fast');
    expect(route).not.toBeNull();
    expect(route.changes).toBe(1);
    expect(route.legs.length).toBe(2);
    expect(route.legs[0].line).toBe('red');
    expect(route.legs[1].line).toBe('blue');
    expect(route.legs[0].stations[0]).toBe('Paldi');
    expect(route.legs[0].stations.at(-1)).toBe('Old High Court');
    expect(route.legs[1].stations[0]).toBe('Old High Court');
    expect(route.legs[1].stations.at(-1)).toBe('Kalupur Railway Station');
  });

  it('computes Vastral Gam to Mahatma Mandir: Blue, Red, Yellow, 2 changes', () => {
    const route = plan('Vastral Gam', 'Mahatma Mandir', 'fast');
    expect(route).not.toBeNull();
    expect(route.changes).toBe(2);
    expect(route.legs.length).toBe(3);
    expect(route.legs[0].line).toBe('blue');
    expect(route.legs[1].line).toBe('red');
    expect(route.legs[2].line).toBe('yellow');
    expect(route.legs[0].stations.at(-1)).toBe('Old High Court');
    expect(route.legs[1].stations.at(-1)).toBe('Motera Stadium');
    expect(route.legs[2].stations.at(-1)).toBe('Mahatma Mandir');
  });

  it('finds stations with alias or fuzzy matching', () => {
    expect(findStation('gift')).toBe('GIFT City');
    expect(findStation('kalupur')).toBe('Kalupur Railway Station');
    expect(findStation('motera')).toBe('Motera Stadium');
  });
});
